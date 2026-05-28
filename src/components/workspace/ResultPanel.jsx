
import SummarizerResult from "./output/SummarizerResult";
import ExtractorOutput from "./output/ExtractorOutput";
import GapExtractorOutput from "./output/GapOutput";
import TopicSuggesterOutput from "../workspace/output/TopicSuggesterOutput.jsx";
import SearcherOutput from "../workspace/output/SearcherOutput.jsx";
import IntegrationOutput from "./output/IntegrationOutput.jsx";
import RRLOutput from "./output/RRLOutput.jsx";
import ObjectiveOutput from "./output/ObjectiveOutput.jsx";

const STEP_INPUT_COMPONENTS = {
  integration: IntegrationOutput,
  extractor: ExtractorOutput,
  summarizer: SummarizerResult,
  rrl: RRLOutput,
  gap: GapExtractorOutput,
  topic: TopicSuggesterOutput,
  objective: ObjectiveOutput,
  search: SearcherOutput
};

export default function ResultPanel({ step, result }) {
  const Component = STEP_INPUT_COMPONENTS[step];
  return <Component result={result} />;
}