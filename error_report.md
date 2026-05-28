# CATalyst Error Report

**Date**: May 28, 2026
**Module**: RRL Assessment, Data Integration
**Severity**: High (Workflow Blocker) - RESOLVED

## 1. Missing Database Table (`rrl_assessment_table`)
- **Error Seen**: `Error fetching RRL assessments: Error: Could not find the table 'public.rrl_assessment_table' in the schema cache`
- **Root Cause**: The RRL Assessment UI and backend were fully implemented, but the corresponding PostgreSQL database table was never created in your Supabase instance.
- **Resolution**: I provided the raw SQL commands for you to run in your Supabase SQL Editor. Once run, the backend successfully connected to the table. I also corrected a discrepancy in the backend where it expected an `assessment_text` column instead of `assessment_feedback`.

## 2. Invalid Table Join Column (`summary_table.filename`)
- **Error Seen**: `Error: column summary_table_1.filename does not exist`
- **Root Cause**: When the RRL output panel loaded, it asked the backend for your previous RRL assessments. The backend attempted to automatically fetch the `filename` of the original PDF from the `summary_table`. However, the `summary_table` does not track filenames (only the raw summary text and title).
- **Resolution**: I updated the backend SQL query in `rrl.controller.js` to only request the `title` of the summary, stopping the fatal crash.

## 3. Gemini API Rate Limiting (Quota Exceeded)
- **Error Seen**: `GoogleGenerativeAI Error... [429 Too Many Requests] You exceeded your current quota...`
- **Root Cause**: The original model (`gemini-2.5-flash`) has an extremely strict 20-request-per-day limit on the Google AI free tier. The fallback model (`gemini-2.0-flash`) had a hard 0-request limit on your specific project configuration.
- **Resolution**: I audited your API key's capabilities and migrated the entire backend architecture to use `gemini-3.1-flash-lite`, which is heavily optimized for speed and allows for 500 requests per day on the free tier.

## 4. AI JSON Parsing Error
- **Error Seen**: `Error: AI returned malformed JSON`
- **Root Cause**: When evaluating papers in the RRL assessment, the AI sometimes wrapped its JSON response in markdown blocks (e.g., ` ```json { ... } ``` `). The backend was trying to parse this raw string directly, which caused a fatal crash.
- **Resolution**: I added a robust regular expression (`/\{[\s\S]*\}/`) to the backend parser that strictly isolates and extracts only the JSON object, completely ignoring any conversational text or markdown the AI tries to append.
