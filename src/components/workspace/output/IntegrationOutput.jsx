import { useEffect, useState } from "react";
import { useGroup } from "../../../context/GroupContext";
import { getIntegratedGapsAPI } from "../../../api/workflow.integration";
import { RiLoader4Line, RiQuestionLine } from "react-icons/ri";

export default function IntegrationOutput({ result }) {
  const group_id = useGroup().groupId;

  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchIntegratedGaps() {
      if (!group_id) return;

      setLoading(true);
      try {
        const res = await getIntegratedGapsAPI(group_id);
        const data = res.data || [];
        setItems(data);

        if (data.length > 0) {
          setActiveId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching integrated gaps:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchIntegratedGaps();
  }, [group_id, result]);

  const activeItem = items.find((p) => p.id === activeId);

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
              Integrated Gaps ({items.length})
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
                <p style={{ color: "#a1a1b5" }}>No integrated gaps yet.</p>
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
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold m-0 text-truncate" style={{ color: "#fff" }}>
                      {item.title}
                    </h6>
                  </div>
                  <div style={{ fontSize: "12px", color: activeId === item.id ? "#e0e0ff" : "#a1a1b5" }}>
                    {new Date(item.created_at).toLocaleDateString()}
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "#fff" }}>
                    Consolidated Research Gap
                  </h4>
                  <div style={{ color: "#a1a1b5", fontSize: "12px" }}>
                    This gap has been merged by AI and is now available for the Topic Suggester.
                  </div>
                </div>
              </div>
              
              <div
                className="p-4 rounded-3 d-flex flex-column flex-grow-1"
                style={{
                  backgroundColor: "#25253a",
                  border: "1px solid #3a3a55",
                  color: "#e4e4f0",
                }}
              >
                <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", fontSize: "15px" }}>
                  {activeItem.gap_analysis}
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: "#a1a1b5" }}>Select an integrated gap to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
