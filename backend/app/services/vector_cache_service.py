"""
AI Recruiter - Offline Local Vector Search Acceleration Service
Provides sub-5ms semantic similarity search across jobs, candidate background,
and interview dossiers with zero external cloud dependencies.
Uses deterministic dimensionality reduction and normalized cosine similarity.
"""

import hashlib
import json
import logging
import math
import os
import re
import time
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("vector_cache_service")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_DIR = os.path.join(ROOT_DIR, "data")
CACHE_FILE = os.path.join(DATA_DIR, "vector_cache.json")

VECTOR_DIMENSIONS = 128
_WORD_RE = re.compile(r"\b[a-zA-Z0-9_\-\.\#\+]{2,}\b")

# High-frequency technical stopwords
STOPWORDS = {
    "the", "and", "for", "with", "this", "that", "from", "are", "have", "you", "your",
    "will", "our", "all", "can", "role", "work", "join", "team", "looking", "about"
}


class VectorCacheService:
    _index: Dict[str, Dict[str, Any]] = {}
    _is_initialized: bool = False

    @classmethod
    def _text_to_vector(cls, text: str) -> List[float]:
        """
        Converts text into a normalized fixed-dimension dense vector representation
        using deterministic token hashing with sub-linear term frequency weighting.
        """
        vec = [0.0] * VECTOR_DIMENSIONS
        tokens = [w.lower() for w in _WORD_RE.findall(text) if w.lower() not in STOPWORDS]
        if not tokens:
            return vec

        counts: Dict[str, int] = {}
        for t in tokens:
            counts[t] = counts.get(t, 0) + 1

        for term, count in counts.items():
            # Hash term to dimension index
            digest = hashlib.md5(term.encode("utf-8")).digest()
            dim = int.from_bytes(digest[:4], "big") % VECTOR_DIMENSIONS
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            weight = (1.0 + math.log(count)) * sign
            vec[dim] += weight

        # L2 Normalization
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0.0:
            vec = [v / norm for v in vec]
        return vec

    @classmethod
    def _cosine_similarity(cls, vec1: List[float], vec2: List[float]) -> float:
        """Calculates cosine similarity between two unit vectors."""
        dot = sum(a * b for a, b in zip(vec1, vec2))
        return max(0.0, min(1.0, (dot + 1.0) / 2.0))

    @classmethod
    def initialize(cls) -> None:
        """Loads cached vectors from disk or warms up default candidate background."""
        if cls._is_initialized and cls._index:
            return

        os.makedirs(DATA_DIR, exist_ok=True)
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    cls._index = json.load(f)
                    cls._is_initialized = True
                    logger.info(f"Loaded {len(cls._index)} cached vectors from {CACHE_FILE}")
                    return
            except Exception as e:
                logger.warning(f"Could not load vector cache: {e}")

        # Seed initial core vectors for candidate domain
        cls.index_document(
            doc_id="candidate_adam_blansett",
            title="Adam Blansett - Staff / Principal Backend & Distributed Systems Architect",
            text=(
                "Staff Software Engineer with 10+ years backend expertise. "
                "Mastery in Python FastAPI Asyncio, Apache Kafka event streaming, "
                "PostgreSQL 16 PgBouncer ACID migrations, Redis distributed caching, "
                "Docker Kubernetes microservices, and local Ollama Llama 3.2 AI orchestration. "
                "99.99% availability SLA, zero-downtime database partitioning."
            ),
            metadata={"candidate": True, "years_experience": 10, "min_salary": 185000},
        )
        cls._is_initialized = True

    @classmethod
    def index_document(
        cls,
        doc_id: str,
        title: str,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Indexes a document into local vector cache."""
        vector = cls._text_to_vector(f"{title} {text}")
        cls._index[doc_id] = {
            "doc_id": doc_id,
            "title": title,
            "snippet": text[:200] + ("..." if len(text) > 200 else ""),
            "vector": vector,
            "metadata": metadata or {},
            "indexed_at": time.time(),
        }

    @classmethod
    def save(cls) -> None:
        """Persists vector cache to disk."""
        try:
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(cls._index, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist vector cache: {e}")

    @classmethod
    def search(
        cls,
        query: str,
        top_k: int = 5,
        threshold: float = 0.5,
    ) -> Dict[str, Any]:
        """
        Executes sub-5ms local vector similarity search.
        Returns ranked results, similarity scores, and execution latency.
        """
        start_time = time.perf_counter()
        if not cls._is_initialized:
            cls.initialize()

        query_vec = cls._text_to_vector(query)
        scored: List[Tuple[float, Dict[str, Any]]] = []

        for doc in cls._index.values():
            sim = cls._cosine_similarity(query_vec, doc["vector"])
            if sim >= threshold:
                scored.append((sim, doc))

        # Sort descending by similarity score
        scored.sort(key=lambda x: x[0], reverse=True)
        selected = scored[:top_k]

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        results = [
            {
                "doc_id": doc["doc_id"],
                "title": doc["title"],
                "snippet": doc["snippet"],
                "similarity_score": round(sim, 4),
                "match_percentage": f"{round(sim * 100, 1)}%",
                "metadata": doc["metadata"],
            }
            for sim, doc in selected
        ]

        return {
            "query": query,
            "results_count": len(results),
            "latency_ms": round(elapsed_ms, 3),
            "results": results,
        }

    @classmethod
    def benchmark(cls, num_docs: int = 500) -> Dict[str, Any]:
        """Runs vector search performance benchmark."""
        # Index sample items if needed
        for i in range(num_docs):
            doc_id = f"bench_doc_{i}"
            if doc_id not in cls._index:
                cls.index_document(
                    doc_id=doc_id,
                    title=f"Distributed Systems Backend Engineer Role #{i}",
                    text=f"High-throughput microservices, Kafka event streams, Redis cache, Python FastAPI tier #{i}",
                    metadata={"index": i},
                )

        t0 = time.perf_counter()
        res = cls.search("Kafka event streaming Python microservices", top_k=5)
        total_time_ms = (time.perf_counter() - t0) * 1000.0

        return {
            "total_documents_indexed": len(cls._index),
            "benchmark_latency_ms": round(total_time_ms, 3),
            "sub_5ms_achieved": total_time_ms < 5.0,
            "top_match": res["results"][0]["title"] if res["results"] else None,
        }
