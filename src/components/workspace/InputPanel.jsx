import ExtractorInput from "./input/ExtractorInput.jsx";
import SummarizerInput from "./input/SummarizerInput.jsx";
import GapInput from "./input/GapInput.jsx";
import TopicSuggesterInput from "./input/TopicSuggesterInput.jsx";
import SearcherInput from "./input/SearcherInput.jsx";
import IntegrationInput from "./input/IntegrationInput.jsx";
import RRLInput from "./input/RRLInput.jsx";
import ObjectiveInput from "./input/ObjectiveInput.jsx";

const STEP_INPUT_COMPONENTS = {
  integration: IntegrationInput,
  extractor: ExtractorInput,
  summarizer: SummarizerInput,
  rrl: RRLInput,
  gap: GapInput,
  topic: TopicSuggesterInput,
  objective: ObjectiveInput,
  search : SearcherInput
};

export default function InputPanel({ step, setResult }) {
  const Component = STEP_INPUT_COMPONENTS[step];
  return <Component setResult = {setResult} />;
}

