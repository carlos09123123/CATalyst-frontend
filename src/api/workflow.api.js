import { apiRequest } from "./http";

export async function extractorAPI(file,group_id) {
  const formData = new FormData();
  formData.append("file", file); // must match multer.single("file")
  formData.append("group_id",group_id);

  return apiRequest("/extractor/file", {
    method: "POST",
    body: formData,
  });
}
export async function summarizerAPI(id, group_id, title){
  return apiRequest(`/summarizer/${id}`, {
    method: "POST",
    body: JSON.stringify({ id, group_id, title }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
export async function GapAPI({ summary_id, group_id, title }){
    return apiRequest(`/gap/${summary_id}`, {
    method: "POST",
    body: JSON.stringify({ id: summary_id, group_id, title }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
export async function TopicSuggesterAPI({group_id, gaps, title}){
      return apiRequest(`/topic/run`, {
    method: "POST",
    body: JSON.stringify({ 
      group_id,
      gaps,
      title
     }),
    headers: {
      "Content-Type": "application/json",
    },
  });

}