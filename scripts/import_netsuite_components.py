"""
One-shot importer: read NetSuite BOM components payload and emit a single
Supabase INSERT statement. Run after materials has been TRUNCATE'd.

Usage:
  1. Save NetSuite query result JSON to scripts/netsuite_components.json
     (the 198-row array from ns_runCustomSuiteQL)
  2. python scripts/import_netsuite_components.py > scripts/import.sql
  3. Apply import.sql via Supabase MCP or dashboard
"""
import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
src = here / "netsuite_components.json"

rows = json.loads(src.read_text(encoding="utf-8"))

CHUNK = 50
for i, start in enumerate(range(0, len(rows), CHUNK)):
    chunk = rows[start:start + CHUNK]
    out = here / f"import_chunk_{i+1}.sql"
    with out.open("w", encoding="utf-8") as f:
        f.write("INSERT INTO public.materials (\n")
        f.write("  netsuite_item_id, material_code, name, purchase_description,\n")
        f.write("  supplier, standard_cost, cost_currency, cost_synced_at, base_unit,\n")
        f.write("  rd_approved, commercial_ready, coa_status, category\n")
        f.write(")\n")
        f.write("SELECT\n")
        f.write("  (r->>'netsuite_item_id')::int,\n")
        f.write("  r->>'item_number',\n")
        f.write("  COALESCE(NULLIF(r->>'name',''), r->>'item_number'),\n")
        f.write("  NULLIF(r->>'purchase_description',''),\n")
        f.write("  NULLIF(r->>'vendor_name',''),\n")
        f.write("  NULLIF(r->>'standard_cost','')::numeric,\n")
        f.write("  'USD', now(),\n")
        f.write("  NULLIF(r->>'stock_unit_label',''),\n")
        f.write("  false, true, 'pending', NULL\n")
        f.write("FROM jsonb_array_elements($NETSUITE$")
        f.write(json.dumps(chunk, ensure_ascii=False))
        f.write("$NETSUITE$::jsonb) AS t(r);\n")
    print(f"wrote {out.name}: {len(chunk)} rows, {out.stat().st_size} bytes")
