
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api"
).replace(/\/+$/, "");

const TIMEOUT_MS = 120000;

export async function analyzeResume({
  resumeFile,
  resumeText,
  jobDescription,
}) {
  const formData = new FormData();

  if (resumeFile) {
    formData.append("resumeFile", resumeFile);
  } else {
    formData.append("resumeText", resumeText);
  }

  formData.append("jobDescription", jobDescription);

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    TIMEOUT_MS
  );

  let response;

  try {
    response = await fetch(`${BASE_URL}/analyze`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    console.error("Resume analysis request failed:", err);

    if (err.name === "AbortError") {
      throw new Error(
        "The analysis is taking too long. Please try again."
      );
    }

    throw new Error(
      "Cannot connect to the backend. Check the backend URL and CORS settings."
    );
  } finally {
    clearTimeout(timer);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error("Backend returned an error:", {
      status: response.status,
      response: data,
    });

    throw new Error(
      data?.message ||
      `Request failed with status ${response.status}.`
    );
  }

  return data;
}
