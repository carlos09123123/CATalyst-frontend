import { useEffect, useState } from "react";
import { useGroup } from "../../../context/GroupContext";
import { getObjectivesAPI, saveObjectiveEditAPI } from "../../../api/workflow.objective";
import { RiLoader4Line, RiQuestionLine } from "react-icons/ri";

export default function ObjectiveOutput({ result }) {
  const group_id = useGroup().groupId;

  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchObjectives() {
      if (!group_id) return;

      setLoading(true);
      try {
        const res = await getObjectivesAPI(group_id);
        const data = res.data || [];
        setItems(data);

        if (data.length > 0) {
          setActiveId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching objectives:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchObjectives();
  }, [group_id, result]);

  const activeItem = items.find((p) => p.id === activeId);

  useEffect(() => {
    if (activeItem) {
      setEditText(activeItem.objectives);
      setEditMode(false);
    }
  }, [activeItem]);

  const handleSaveEdit = async () => {
    if (!activeItem) return;
    setSaving(true);
    try {
      const res = await saveObjectiveEditAPI(activeItem.id, editText);
      // Add the new version to the top of the list and set as active
      const newItem = res.data;
      // We need to attach the populated tables manually to display correctly before next fetch
      newItem.gap_table = activeItem.gap_table;
      newItem.topic_table = activeItem.topic_table;
      
      setItems(prev => [newItem, ...prev]);
      setActiveId(newItem.id);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
              Objective Sets ({items.length})
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
                <p style={{ color: "#a1a1b5" }}>No objectives generated yet.</p>
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
                      v{item.version}
                    </h6>
                    <small style={{ fontSize: "10px", color: activeId === item.id ? "#e0e0ff" : "#a1a1b5" }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div style={{ fontSize: "12px", color: activeId === item.id ? "#e0e0ff" : "#a1a1b5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Gap: {item.gap_table?.title || 'Untitled Gap'}
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
                    SMART Objectives (v{activeItem.version})
                  </h4>
                  <div style={{ color: "#a1a1b5", fontSize: "12px" }}>
                    Topic: {activeItem.topic_table?.title || 'Untitled Topic'}
                  </div>
                </div>
                
                <div className="d-flex gap-2">
                  {editMode ? (
                    <>
                      <button 
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="btn btn-sm btn-success"
                      >
                        {saving ? "Saving..." : "Save as New Version"}
                      </button>
                      <button 
                        onClick={() => {
                          setEditMode(false);
                          setEditText(activeItem.objectives);
                        }}
                        className="btn btn-sm btn-outline-secondary"
                        style={{ color: "#fff" }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setEditMode(true)}
                      className="btn btn-sm btn-outline-light"
                    >
                      Edit Objectives
                    </button>
                  )}
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
                {editMode ? (
                  <textarea
                    className="form-control flex-grow-1"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ 
                      backgroundColor: "#1e1e2f", 
                      color: "#fff", 
                      border: "1px solid #5b5bd6",
                      resize: "none",
                      minHeight: "300px"
                    }}
                  />
                ) : (
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", fontSize: "15px" }}>
                    {activeItem.objectives}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p style={{ color: "#a1a1b5" }}>Select an objective set to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
