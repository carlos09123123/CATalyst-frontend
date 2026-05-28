# CATalyst App Workflow

This document outlines the intended end-to-end user flow for the CATalyst application. The system is designed to take raw academic literature and intelligently process it into actionable, focused research objectives using a series of specialized AI modules.

## Module 1: Extractor
**Goal**: Convert raw PDFs into readable text.
1. The user uploads a PDF of an academic paper.
2. The Extractor parses the PDF, cleans up the formatting, and extracts the raw text.
3. **Output**: Raw, extracted document text saved to the database.

## Module 2: Summarizer
**Goal**: Condense lengthy academic papers into key insights.
1. The system pulls the raw text from the Extractor.
2. Gemini AI reads the text and generates a structured summary highlighting the objectives, methodology, and findings.
3. **Output**: A concise academic summary.

## Module 3: Gap Extractor
**Goal**: Identify missing links in existing research.
1. The user selects a summary they generated in the previous step.
2. Gemini AI analyzes the summary to detect limitations, future research recommendations, and unexplored areas.
3. **Output**: A specific "Research Gap".

## Module 4: Topic Suggester
**Goal**: Generate thesis titles based on gaps.
1. The user selects a specific Research Gap.
2. Gemini AI suggests 5 distinct, highly relevant research topics (titles) that directly address the gap.
3. The user can rate these topics (1-5 stars).
4. **Output**: A list of potential research topics.

## Module 5: Data Integration
**Goal**: Synthesize multiple gaps into a single cohesive direction.
1. The user selects 2 to 3 individual research gaps from their library.
2. Gemini AI cross-references these gaps and consolidates them, finding the overarching theme that connects the literature.
3. **Output**: A single "Integrated Research Gap" that is saved back to the database.

## Module 6: RRL Assessment
**Goal**: Evaluate the quality of the literature.
1. The user selects a summary from their library.
2. Gemini AI grades the literature based on Recency, Alignment, Significance, and Relevance, outputting a JSON scorecard.
3. **Output**: A comprehensive assessment scorecard for the paper.

## Module 7: SMART Objectives
**Goal**: Formulate actionable research steps.
1. The user pairs a specific Research Gap (or an Integrated Gap) with a chosen Research Topic.
2. Gemini AI generates 3 to 4 SMART (Specific, Measurable, Attainable, Relevant, Time-bound) objectives to guide the research.
3. **Output**: A final list of actionable research objectives that the user can manually edit and save.
