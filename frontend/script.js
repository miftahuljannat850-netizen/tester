// EDIT THIS: point to wherever the backend is running.
// Same VPS, different port  -> http://YOUR_VPS_IP:5000
// Local testing             -> http://localhost:5000
const BACKEND_URL = "";

const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const status = document.getElementById("status");
const fileList = document.getElementById("fileList");

async function loadFiles() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/files`);
    const files = await res.json();

    fileList.innerHTML = "";
    files.forEach((f) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `${BACKEND_URL}${f.url}`;
      a.textContent = f.name;
      a.target = "_blank";
      li.appendChild(a);
      fileList.appendChild(li);
    });
  } catch (err) {
    console.error("Could not load files:", err);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file); // field name must match backend: upload.single('file')

  status.textContent = "Uploading...";

  try {
    const res = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    status.textContent = `Uploaded: ${data.file.originalName}`;
    fileInput.value = "";
    loadFiles();
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
  }
});

// Load existing files on page load
loadFiles();
