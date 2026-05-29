import { useEffect, useState } from "react";
import { useGroup } from "../../../context/GroupContext";
import { getRRLAssessmentsAPI, submitRRLFeedbackAPI } from "../../../api/workflow.rrl";
import { RiLoader4Line, RiQuestionLine } from "react-icons/ri";

export default function RRLOutput({ result }) {
  const group_id = useGroup().groupId;

  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAssessments() {
      if (!group_id) return;

      setLoading(true);
      try {
        const res = await getRRLAssessmentsAPI(group_id);
        const data = res.data || [];
        setItems(data);

        if (data.length > 0) {
          setActiveId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching RRL assessments:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessments();
  }, [group_id, result]);

  const handleFeedback = async (id, action) => {
    try {
      await submitRRLFeedbackAPI(id, action);
      // Update local state
      setItems(prev => prev.map(item => item.id === id ? { ...item, user_feedback: action } : item));
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const activeItem = items.find((p) => p.id === activeId);
  
  let parsedDetails = null;
  if (activeItem && activeItem.assessment_feedback) {
    try {
      parsedDetails = JSON.parse(activeItem.assessment_feedback);
    } catch (e) {
      console.error("Failed to parse JSON assessment:", e);
    }
  }

  const activeFeedback = activeItem?.user_feedback || parsedDetails?.user_feedback || null;

  return (
    <div
      className="h-100 d-flex flex-column rounded-4 p-3"
      style={{
        backgroundColor: "#1e1e2f",
        border: "1px solid #3a3a55",
        color: "#e4e4f0",
        minHeight: 0,
      }}
    >
      <div className="d-flex gap-3 h-100" style={{ minHeight: 0 }}>
        {/* LEFT SIDEBAR */}
        <div
          className="d-flex flex-column"
          style={{
            width: "250px",
            maxWidth: "35%",
            borderRight: "1px solid #3a3a55",
            minHeight: 0,
          }}
        >
          <div className="mb-2">
            <p className="small fw-bold text-uppercase mb-0" style={{ color: "#a1a1b5" }}>
              Assessments ({items.length})
            </p>
          </div>

          <div className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
            {loading ? (
              <div className="text-center mt-5">
                <RiLoader4Line className="fs-1 mb-2" />
                <p style={{ color: "#a1a1b5" }}>Loading...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center mt-5">
                <RiQuestionLine className="fs-1 mb-2" />
                <p style={{ color: "#a1a1b5" }}>No assessments generated yet.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className="p-3 mb-2 rounded-3"
                  style={{
                    cursor: "pointer",
                    backgroundColor: activeId === item.id ? "#5b5bd6" : "#25253a",
                    border: "1px solid #3a3a55",
                    overflow: "hidden",
                  }}
                >
                  <h6 className="fw-bold mb-1 text-truncate" style={{ color: "#fff" }}>
                    Score: {item.relevance_score}/100
                  </h6>
                  <div style={{ fontSize: "12px", color: activeId === item.id ? "#e0e0ff" : "#a1a1b5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.summary_title || item.summary_table?.title || 'Untitled'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div
          className="flex-grow-1 d-flex flex-column"
          style={{
            paddingLeft: "1rem",
            minHeight: 0,
            maxWidth: "calc(100% - 250px)",
            overflowY: "auto",
          }}
        >
          {activeItem ? (
            <>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "#fff" }}>
                    RRL Assessment Scorecard
                  </h4>
                  <div style={{ color: "#a1a1b5" }}>
                    Target: {activeItem.summary_title || activeItem.summary_table?.title || 'Untitled Summary'}
                  </div>
                </div>
                
                {/* Feedback Buttons */}
                <div className="d-flex gap-2">
                  <button 
                    onClick={() => handleFeedback(activeItem.id, 'accept')}
                    className={`btn btn-sm ${activeFeedback === 'accept' ? 'btn-success' : 'btn-outline-success'}`}
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleFeedback(activeItem.id, 'reject')}
                    className={`btn btn-sm ${activeFeedback === 'reject' ? 'btn-danger' : 'btn-outline-danger'}`}
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleFeedback(activeItem.id, 'flag')}
                    className={`btn btn-sm ${activeFeedback === 'flag' ? 'btn-warning' : 'btn-outline-warning'}`}
                  >
                    Flag
                  </button>
                </div>
              </div>
              
              <div
                className="p-4 rounded-3 d-flex flex-column gap-3"
                style={{
                  backgroundColor: "#25253a",
                  border: "1px solid #3a3a55",
                  color: "#e4e4f0",
                }}
              >
                {parsedDetails ? (
                  <>
                    <div className="d-flex align-items-center justify-content-between pb-3" style={{ borderBottom: "1px solid #3a3a55" }}>
                      <div><strong style={{color:"#a1a1b5"}}>Overall Score:</strong> <span className="fs-5 text-white fw-bold">{parsedDetails.relevance_score}/100</span></div>
                    </div>
                    <div>
                      <strong style={{color:"#a1a1b5"}}>Recency:</strong> <span className="text-white">{parsedDetails.recency_rating}</span>
                    </div>
                    <div>
                      <strong style={{color:"#a1a1b5"}}>Alignment:</strong> <span className="text-white">{parsedDetails.alignment_rating}</span>
                    </div>
                    <div>
                      <strong style={{color:"#a1a1b5"}}>Significance:</strong> <span className="text-white">{parsedDetails.significance_rating}</span>
                    </div>
                    <div>
                      <strong style={{color:"#a1a1b5"}}>Relevance:</strong> <span className="text-white">{parsedDetails.relevance_rating}</span>
                    </div>
                    
                    <div className="pt-3" style={{ borderTop: "1px solid #3a3a55" }}>
                      <strong style={{color:"#a1a1b5"}}>Full Assessment:</strong>
                      <p className="mt-2 mb-0 text-white" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                        {parsedDetails.full_assessment}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="mb-0" style={{ whiteSpace: "pre-wrap", color: "#a1a1b5" }}>
                    {activeItem.assessment_feedback || "No assessment details available."}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p style={{ color: "#a1a1b5" }}>Select an assessment to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
