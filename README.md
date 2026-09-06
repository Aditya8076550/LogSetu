# LogSetu — Universal Log Interoperability Platform
> **"One common language for every security event."**

**Smart India Hackathon 2026 (SIH26156) — NTRO**  
*Universal Log Pre-processing Framework (ULPF)*

---

### 🛡️ Product Statement & Architectural Philosophy
> **LogSetu does not replace OpenTelemetry or SIEM platforms. It provides an interoperability and trust layer between heterogeneous security-event sources and downstream systems.**

LogSetu onboards previously unseen log sources through AI-assisted structure discovery and semantic mapping, validates the generated mapping before activation via strict deterministic replay, converts heterogeneous events into an OCSF Class 4001 universal representation, reduces analytical noise while preserving complete raw evidence, and maintains end-to-end lineage and cryptographic tamper-evident integrity.

---

### 🏛️ End-to-End Pipeline Architecture

```
   Heterogeneous Security Sources (Firewalls, EDR, Cloud, Custom Micro-Appliances)
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Stage 1: Lossless Ingest   │
                      │  Raw Evidence Capture (SHA256)│
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │ Stage 2: Edge Preprocessing   │
                      │  Local PII & Secret Redaction │
                      └───────────────┬───────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        ┌─────────────────────┐               ┌─────────────────────┐
        │  Known Deterministic │               │ Stage 3: Discovery  │
        │    Parser Engines    │               │ AI Structure Propose│
        └──────────┬──────────┘               └──────────┬──────────┘
                   │                                     │
                   │                          ┌──────────┴──────────┐
                   │                          │Stage 4: Replay Gate │
                   │                          │Strict Type & Val    │
                   │                          └──────────┬──────────┘
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      │ (DynamicConfiguredParser)
                                      ▼
                      ┌───────────────────────────────┐
                      │ Stage 5: Universal Event (4001)│
                      │  OCSF Model + Field Provenance │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │ Stage 6: Trust & Correlation  │
                      │  Merkle Trees + Noise Reduct. │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │ Downstream Destination Sinks  │
                      │  OTel, Parquet, JSON, SIEM    │
                      └───────────────────────────────┘
```

---

### 🚀 Core Platform Capabilities

#### 1. Truly Generic Dynamic Parser Engine
- **No Vendor Hardcoding**: Dynamic parsing executes purely against declarative `ParserSpecification` JSON models.
- **Format Support**: Delimited Key-Value (`#`, `::`, `|`, `=`), XML Tag Attributes, JSON / NDJSON, Positional Delimited logs.
- **Strict Normalization**: Extracted values are normalized into OCSF Class 4001 taxonomy without fabricating missing fields (`SOURCE_FIELD_UNAVAILABLE` or `null`).

#### 2. Strict AI Onboarding & Validation Gate
- **AI As An Assistant, Not Runtime Code**: AI infers structural tokens and taxonomy mappings once during onboarding.
- **Deterministic Post-Activation Fast-Path**: Once approved by an operator, subsequent events from that source bypass AI completely, running deterministically with `<1ms` parsing latency.
- **Separate Confidence Layers**:
  - AI Mapping Proposal Confidence
  - Schema Completeness Validation
  - Field Type Safety (IP regex, Port integer, ISO timestamps)
  - Strict Replay Pass Rate against unseen test samples (configurable threshold, default ≥95%)

#### 3. Adaptive Noise Reduction (Lossless Grouping)
- **Analytical Grouping**: Groups repetitive high-frequency connection / drop logs by `(vendor, product, src_ip, dst_ip, action, severity)`.
- **100% Raw Evidence Retention**: Every aggregation retains an array of `raw_event_refs: [id1, id2, ...]`, maintaining uncompromised forensic custody.

#### 4. Tamper-Evident Cryptographic Custody
- **SHA-256 Hashing**: Canonical deterministic serialization of every raw payload.
- **Merkle Tree Sealing**: Grouped batch sealing linked cryptographically to the previous batch root (`chain_hash`).
- **Sandboxed Tamper Demonstration**: Interactive proof showing bit-flip alteration detection without corrupting production store.

#### 5. Vendor-Neutral Export Hub
- **OpenTelemetry (OTel)**: Standard `opentelemetry.proto.logs.v1.ResourceLogs` export.
- **Apache Parquet**: Genuine columnar binary `.parquet` files with Snappy compression and `PAR1` magic bytes.
- **Universal JSON & JSONL**: Streaming lines and arrays.
- **OpenSearch / Elasticsearch**: Live connector with strict type mappings.

#### 6. Air-Gapped Readiness & Edge Redaction
- **Local Fallback Heuristics**: Operates entirely offline without external AI API dependencies.
- **Sensitive-Field Redaction**: Masks API keys (`sk_live_...`), passwords, bearer tokens, and private keys locally before processing.

---

### 💻 Local Installation & Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (Backend + Frontend)
npm run dev

# 3. Open your browser
# Navigate to http://localhost:3000 (or the port shown in terminal)
```

---

### 🧪 10-Step Judge Acceptance Journey

1. **Platform Overview**: Click **"Start Judge Demo"** in header to populate multi-vendor perimeter traffic.
2. **Deterministic Processing**: Inspect normalized events from FortiGate, Cisco ASA, pfSense, Suricata, Windows, and Linux.
3. **Unknown Source Onboarding**: Navigate to **"Onboard Source"**, select *Preset: GWX Perimeter Gateway*, inspect AI structure discovery and delimiter inference.
4. **Validation Gate & Replay**: Inspect 100% replay test pass rate and approve the compiled `ParserSpecification`.
5. **Deterministic Activation**: Send a new event from the onboarded device; verify instant normalization with zero AI cost.
6. **Adaptive Noise Reduction**: Navigate to **"Live Events"**, toggle *Adaptive Aggregation*, observe analytical noise reduction with lossless raw event references.
7. **Cross-Source Correlation**: Navigate to **"Correlation"**, view explainable attack scoring linking Windows + Linux + Firewall events.
8. **Field Lineage & Provenance**: Click any event row to view raw payload, SHA-256 hash, and field transformation graph.
9. **Controlled Tamper Test**: Navigate to **"Integrity & Lineage"**, run the sandboxed tamper simulation, verify Merkle proof mismatch alert.
10. **Vendor-Neutral Export**: Navigate to **"Exports & Connectors"**, export OpenTelemetry OTLP ResourceLogs and genuine Apache Parquet binary files.
