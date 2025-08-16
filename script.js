// Set the workerSrc for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;



const fileInput = document.getElementById("pdf-file");
const fileNameDisplay = document.getElementById("file-name");
const statusMessage = document.getElementById("status-message");
const downloadBtn = document.getElementById("download-btn");
let jsonData = null;
let originalFileName = "";

// Event listener for file selection
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    originalFileName = file.name.replace(/\.pdf$/i, "");
    fileNameDisplay.textContent = file.name;
    updateStatus("Processing your PDF...", true);
    downloadBtn.classList.add("hidden");
    jsonData = null;
    handlePdf(file);
  } else {
    fileNameDisplay.textContent = "Click to upload or drag and drop a PDF";
    updateStatus("Please select a valid PDF file.", false);
    downloadBtn.classList.add("hidden");
  }
});

// Drag and drop functionality
const dropArea = document.querySelector(".file-input-label");
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("bg-sky-50", "border-sky-400");
});
dropArea.addEventListener("dragleave", () =>
  dropArea.classList.remove("bg-sky-50", "border-sky-400")
);
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("bg-sky-50", "border-sky-400");
  if (e.dataTransfer.files[0]) {
    fileInput.files = e.dataTransfer.files;
    fileInput.dispatchEvent(new Event("change"));
  }
});

/**
 * Updates the status message and shows/hides a loading spinner.
 * @param {string} message - The message to display.
 * @param {boolean} isLoading - Whether to show the loading spinner.
 */
function updateStatus(message, isLoading) {
  statusMessage.innerHTML = `${
    isLoading ? '<div class="loader"></div>' : ""
  }<span>${message}</span>`;
}

/**
 * Extracts text from the PDF and passes it to the AI for parsing.
 * @param {File} file - The PDF file to process.
 */
async function handlePdf(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const typedarray = new Uint8Array(e.target.result);
    try {
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        updateStatus(
          `Extracting text from page ${i} of ${pdf.numPages}...`,
          true
        );
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText +=
          textContent.items.map((item) => item.str).join(" ") + "\n\n";
      }

      updateStatus("Text extracted. Asking AI to structure the data...", true);
      await parseResumeWithAI(fullText);
    } catch (error) {
      console.error("Error parsing PDF:", error);
      updateStatus(
        `❌ Error: Could not process the PDF file. ${error.message}`,
        false
      );
    }
  };
  reader.readAsArrayBuffer(file);
}

/**
 * Sends the extracted text to the Gemini AI to get a structured JSON response.
 * @param {string} text - The full text extracted from the PDF.
 */


async function parseResumeWithAI(text) {
  // Fetch the API key from the Express server
  let apiKey = '';
  try {
    const keyResponse = await fetch('http://localhost:3000/api-key');
    const keyData = await keyResponse.json();
    apiKey = keyData.apiKey;
  } catch (err) {
    updateStatus('❌ Error: Could not retrieve API key from server.', false);
    return;
  }
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // This schema tells the AI exactly how to structure the JSON output.
  // It's now more specific to avoid errors.
  const schema = {
    type: "OBJECT",
    properties: {
      personal: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          phone: { type: "STRING" },
          email: { type: "STRING" },
          pincode: { type: "STRING" },
          city: { type: "STRING" },
          country: { type: "STRING" },
          summary: { type: "STRING" },
        },
      },
      skills: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING" },
            skills: { type: "STRING" },
          },
        },
      },
      education: {
        type: "OBJECT",
        properties: {
          degree: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              branch: { type: "STRING" },
              board: { type: "STRING" },
              gpa: { type: "STRING" },
              location: { type: "STRING" },
              start: { type: "STRING" },
              end: { type: "STRING" },
            },
          },
          inter: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              branch: { type: "STRING" },
              board: { type: "STRING" },
              gpa: { type: "STRING" },
              location: { type: "STRING" },
              start: { type: "STRING" },
              end: { type: "STRING" },
            },
          },
          school: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              branch: { type: "STRING" },
              board: { type: "STRING" },
              gpa: { type: "STRING" },
              location: { type: "STRING" },
              start: { type: "STRING" },
              end: { type: "STRING" },
            },
          },
        },
      },
      experience: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            role: { type: "STRING" },
            name: { type: "STRING" },
            location: { type: "STRING" },
            start: { type: "STRING" },
            end: { type: "STRING" },
            description: { type: "STRING" },
          },
        },
      },
      projects: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            start: { type: "STRING" },
            end: { type: "STRING" },
            techStack: { type: "STRING" },
            description: { type: "STRING" },
          },
        },
      },
      achievements: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            description: { type: "STRING" },
            name: { type: "STRING" },
            url: { type: "STRING" },
          },
        },
      },
      certifications: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            description: { type: "STRING" },
            name: { type: "STRING" },
            url: { type: "STRING" },
          },
        },
      },
      misc: {
        type: "OBJECT",
        properties: {
          profiles: {
            type: "OBJECT",
            properties: {
              linkedin: { type: "STRING" },
              github: { type: "STRING" },
              portfolio: { type: "STRING" },
              other: { type: "STRING" },
            },
          },
          languages: { type: "STRING" },
          hobbies: { type: "STRING" },
        },
      },
    },
  };

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Parse the following resume text and structure it into a JSON object based on the provided schema. Only return the valid JSON object. Here is the resume text:\n\n${text}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", errorBody);
      throw new Error(
        `API request failed with status ${response.status}. See console for details.`
      );
    }

    const result = await response.json();

    if (
      result.candidates &&
      result.candidates[0].content &&
      result.candidates[0].content.parts[0]
    ) {
      const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
      jsonData = JSON.stringify(parsedJson, null, 2); // Pretty print for download
      updateStatus("✅ AI processing complete! Ready to download.", false);
      downloadBtn.classList.remove("hidden");
    } else {
      console.error("Unexpected AI response structure:", result);
      throw new Error(
        "Invalid response structure from AI. See console for details."
      );
    }
  } catch (error) {
    console.error("Error with AI processing:", error);
    updateStatus(
      `❌ Error: AI could not process the text. ${error.message}`,
      false
    );
  }
}

// Event listener for the download button
downloadBtn.addEventListener("click", () => {
  if (jsonData) {
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${originalFileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});
