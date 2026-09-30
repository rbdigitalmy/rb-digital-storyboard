import { App } from "@modelcontextprotocol/ext-apps";

type JsonRecord = Record<string, unknown>;

const workflows = [
  ["storyboard-universal", "Universal"], ["storyboard-pov-hand", "POV Hand"],
  ["storyboard-talking-head", "Talking Head"], ["storyboard-asmr", "ASMR"],
  ["storyboard-stop-motion", "Stop Motion"], ["storyboard-podcast", "Podcast"],
  ["cartoon-storyboard", "Cartoon"], ["storyboard-chibi", "Chibi"],
  ["storyboard-pix", "3D Cinematic"], ["storyboard-grafix", "Grafix"],
  ["storyboard-anthropomorphic", "Anthropomorphic"], ["real-product", "Real Product"],
  ["real-human", "Real Human"], ["realtoon", "Realtoon"],
  ["character-sheet", "Character Sheet"], ["kawaii-image", "Kawaii"],
  ["ootd", "OOTD"], ["poster", "Poster"], ["thumbnail", "Thumbnail"],
] as const;

const app = new App({ name: "RB Digital Storyboard", version: "1.0.0" }, {}, { autoResize: true });
let selectedStyle = "storyboard-universal";

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function setStatus(message: string) { byId<HTMLDivElement>("status").textContent = message; }

function renderStyles() {
  const container = byId<HTMLDivElement>("styles");
  container.innerHTML = "";
  workflows.forEach(([id, name]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `style${id === selectedStyle ? " active" : ""}`;
    button.textContent = name;
    button.onclick = () => { selectedStyle = id; renderStyles(); };
    container.appendChild(button);
  });
}

function unwrap(result: JsonRecord): JsonRecord {
  return (result.structuredContent as JsonRecord | undefined) || result;
}

function applyInitialData(payload: JsonRecord) {
  const data = unwrap(payload);
  const access = (data.access || data) as JsonRecord;
  const settings = (data.settings || {}) as JsonRecord;
  const pill = byId<HTMLSpanElement>("access-pill");
  const allowed = Boolean(access.access_granted);
  pill.textContent = allowed ? `Active · ${String(access.balance ?? 0)} credits` : "Purchase required";
  pill.className = `pill ${allowed ? "ok" : "no"}`;
  byId<HTMLButtonElement>("generate").disabled = !allowed;
  if (settings.default_style) selectedStyle = String(settings.default_style);
  if (settings.default_duration) byId<HTMLSelectElement>("duration").value = String(settings.default_duration);
  if (settings.language) byId<HTMLSelectElement>("language").value = String(settings.language);
  if (settings.aspect_ratio) byId<HTMLSelectElement>("ratio").value = String(settings.aspect_ratio);
  renderStyles();
}

function renderStoryboard(payload: JsonRecord) {
  const data = unwrap(payload);
  const storyboard = (data.storyboard || data) as JsonRecord;
  const scenes = Array.isArray(storyboard.scenes) ? storyboard.scenes as JsonRecord[] : [];
  const result = byId<HTMLElement>("result");
  result.className = "card";
  result.innerHTML = `<div class="access"><strong>${String(storyboard.topic || "Storyboard")}</strong><span class="pill ok">${String(data.remaining_balance ?? "")} credits left</span></div>`;
  scenes.forEach((scene) => {
    const item = document.createElement("article");
    item.className = "scene";
    item.innerHTML = `<h3>Scene ${String(scene.scene_number)} · ${String(scene.timeframe)}</h3><p><b>Visual:</b> ${String(scene.visual)}</p><p><b>Camera:</b> ${String(scene.camera)}</p><p><b>Dialogue:</b> ${String(scene.dialogue)}</p>`;
    result.appendChild(item);
  });
}

app.addEventListener("toolinput", ({ arguments: args }) => {
  if (args && Object.keys(args).length) {
    if (typeof args.topic === "string") byId<HTMLTextAreaElement>("topic").value = args.topic;
    if (typeof args.workflow_id === "string") selectedStyle = args.workflow_id;
  }
});

app.addEventListener("toolresult", (result) => {
  const structured = (result as unknown as JsonRecord).structuredContent as JsonRecord | undefined;
  if (structured?.storyboard) renderStoryboard(structured);
  else if (structured) applyInitialData(structured);
});

byId<HTMLFormElement>("storyboard-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = byId<HTMLButtonElement>("generate");
  button.disabled = true;
  setStatus("Generating your production storyboard...");
  try {
    const result = await app.callServerTool({
      name: "generate_storyboard",
      arguments: {
        topic: byId<HTMLTextAreaElement>("topic").value,
        workflow_id: selectedStyle,
        duration: byId<HTMLSelectElement>("duration").value,
        language: byId<HTMLSelectElement>("language").value,
        aspect_ratio: byId<HTMLSelectElement>("ratio").value,
        target_audience: byId<HTMLInputElement>("audience").value,
        request_id: crypto.randomUUID(),
      },
    });
    const payload = result as unknown as JsonRecord;
    if (payload.isError) throw new Error("Generation was rejected. Check your license or credits.");
    renderStoryboard(payload);
    setStatus("Storyboard generated successfully.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Generation failed.");
  } finally {
    button.disabled = false;
  }
});

renderStyles();
void app.connect().catch((error) => {
  setStatus(error instanceof Error ? `Unable to connect to ChatGPT: ${error.message}` : "Unable to connect to ChatGPT.");
});
