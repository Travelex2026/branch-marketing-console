// ===================== Branch Marketing Console (standalone) =====================
(function () {
  "use strict";

  var STATE = { branches: [], benefits: [], calendar: [], assets: [] };

  // ---- Static option lists ----
  var STAGE_OPTIONS = ["Not Contacted", "Outreach Sent", "Meeting Scheduled", "Meeting Held",
    "Lease Benefits Captured", "Onboarded - Active", "On Hold", "Declined / Not Applicable"];

  var BENEFIT_TYPE_OPTIONS = ["Social Media Feature", "Newsletter / Email Feature",
    "Mall Website Feature (Specials / What's On)", "Poster / Light Box / Snapper Frame Placement",
    "Flyer / Pamphlet Distribution", "Window Display", "In-Branch / Concourse Signage",
    "Digital Screen / Media Wall", "Escalator / Elevator Branding",
    "Wall Ad / Boom Gate / Parkade Billboard", "Audio-in-Mall Advert", "Exhibition / Activation Space",
    "Bathroom Advertising", "Co-op Advertising Fund", "Other"];

  var COST_TYPE_OPTIONS = ["Free - Included in Lease", "Free Space - Client Pays Printing & Installation",
    "Free - Client Supplies Item (self-service)", "Paid - Tenant/Landlord Discounted Rate",
    "Paid - Full Rate Card", "Not Offered"];

  var BENEFIT_STATUS_OPTIONS = ["Confirmed", "Pending Landlord Approval", "Expired", "Not Offered"];

  var CALENDAR_STATUS_OPTIONS = ["Planning", "In Production", "Approved", "Sent", "Complete"];

  var CHANNEL_OPTIONS = ["Email", "Courier / Print Delivery", "Branch Portal", "WhatsApp", "In-Person"];

  var CONFIRMED_OPTIONS = ["Yes", "No", "Pending"];

  var DEFAULTS = [
    { type: "Social Media Feature", cost: "Free - Included in Lease",
      means: "Centre posts to its own Facebook/Instagram/TikTok on the tenant's behalf.",
      confirm: "Approval process, image specs (usually JPEG/PNG, under 1MB), submission deadline (often 3-7 working days ahead)." },
    { type: "Newsletter / Email Feature", cost: "Free - Included in Lease",
      means: "Included in the centre's own tenant/customer communications, subject to space and approval.",
      confirm: "Frequency, content deadline, format required." },
    { type: "Mall Website Feature (Specials / What's On)", cost: "Free - Included in Lease",
      means: "Centre publishes tenant specials/events on its own website (a 'Specials' or 'What's On' tab).",
      confirm: "Exact image size in pixels, file format/size limit, submission deadline." },
    { type: "Poster / Light Box / Snapper Frame Placement", cost: "Free Space - Client Pays Printing & Installation",
      means: "Centre provides the physical frame or display space at no charge; the tenant pays to print and install the poster.",
      confirm: "Frame size (commonly A1), how often it can be changed, who installs it." },
    { type: "Flyer / Pamphlet Distribution", cost: "Free - Client Supplies Item (self-service)",
      means: "Usually limited to an information kiosk, not entrances or parkades. Tenant supplies printed flyers; the centre distributes/displays them.",
      confirm: "Number of slots per month, duration per slot, booking lead time, delivery point." },
    { type: "Window Display", cost: "Varies - Confirm at meeting",
      means: "Some centres allow window displays at no charge; others just require sign-off with no direct cost.",
      confirm: "Size/frequency limits, approval process." },
    { type: "Digital Screen / Media Wall", cost: "Paid - Tenant/Landlord Discounted Rate",
      means: "Usually managed by a third-party media partner. Tenants often get a discounted rate off the public rate card, plus separate production/printing and flighting (airtime) fees.",
      confirm: "Rate card price vs tenant discount rate, production cost, minimum booking period." },
    { type: "Escalator / Elevator Branding", cost: "Paid - Tenant/Landlord Discounted Rate",
      means: "Paid placement, typically with the same rate-card-vs-discount structure as digital screens.",
      confirm: "Rate, minimum booking period, production/printing cost." },
    { type: "Wall Ad / Boom Gate / Parkade Billboard", cost: "Paid - Tenant/Landlord Discounted Rate",
      means: "Paid placement, often billed per fixed booking period (e.g. 2 weeks). May have a preferred production supplier.",
      confirm: "Rate, booking period, preferred supplier, printing/installation cost." },
    { type: "Audio-in-Mall Advert", cost: "Paid - Full Rate Card",
      means: "Usually a specialist media partner, sold in monthly packages by number of plays.",
      confirm: "Package tiers, minimum spend, production cost." },
    { type: "Bathroom Advertising", cost: "Paid - Full Rate Card",
      means: "Usually a specialist media partner, sold in monthly packages by number of plays.",
      confirm: "Package tiers, minimum spend, production cost." },
    { type: "Exhibition / Activation Space", cost: "Paid - Tenant/Landlord Discounted Rate",
      means: "Tenants often get preferential rates for in-centre promotional/exhibition space versus external brands.",
      confirm: "Availability, rates (usually on request), booking process." },
    { type: "Co-op Advertising Fund", cost: "Varies - Confirm at meeting",
      means: "Some leases include a landlord contribution toward joint/centre-wide marketing.",
      confirm: "Amount, how it's accessed, any conditions attached." }
  ];

  var GENERAL_NOTES = [
    "Advertising/marketing charges are usually added directly to the tenant's rental/lease statement, not invoiced separately.",
    "Book early — availability is first-come, first-served and subject to landlord/centre management approval.",
    "Prices typically exclude VAT unless stated otherwise.",
    "Free digital content (social media, website, newsletter) usually needs several working days' lead time and strict specs — exact pixel dimensions, JPEG/PNG only, under 1MB, no PDFs or file-transfer links.",
    "Paid placements (screens, elevators, walls, booms, parkade billboards) are typically billed in three parts, all excl. VAT: the rate card price, a lower tenant/landlord discounted rate, and separate printing/production plus flighting/installation fees."
  ];

  // ---- Field schemas ----
  var BRANCH_SCHEMA = [
    { key: "id", label: "Branch ID", type: "text", readonly: true },
    { key: "name", label: "Branch Name", type: "text", span2: true },
    { key: "region", label: "Region / Province", type: "text" },
    { key: "address", label: "Branch Address", type: "textarea", span2: true },
    { key: "manager", label: "Marketing Contact Name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "stage", label: "Engagement Stage", type: "select", options: STAGE_OPTIONS },
    { key: "firstContact", label: "First Contact Date", type: "date" },
    { key: "lastContact", label: "Last Contact Date", type: "date" },
    { key: "nextAction", label: "Next Action", type: "text", span2: true },
    { key: "nextActionDate", label: "Next Action Date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", span2: true }
  ];

  var BENEFIT_SCHEMA = [
    { key: "branchName", label: "Branch Name", type: "branchpicker", span2: true },
    { key: "benefitType", label: "Benefit Type", type: "select", options: BENEFIT_TYPE_OPTIONS },
    { key: "costType", label: "Cost Type", type: "select", options: COST_TYPE_OPTIONS },
    { key: "details", label: "Details / Description", type: "textarea", span2: true },
    { key: "value", label: "Value, Limit or Rate", type: "text" },
    { key: "status", label: "Status", type: "select", options: BENEFIT_STATUS_OPTIONS },
    { key: "meetingDate", label: "Meeting Date (Source)", type: "date" },
    { key: "reviewDate", label: "Review / Expiry Date", type: "date" },
    { key: "capturedBy", label: "Captured By", type: "text" },
    { key: "fileId", nameKey: "fileName", label: "Supporting Document (PDF or image)", type: "file", span2: true },
    { key: "notes", label: "Notes", type: "textarea", span2: true }
  ];

  var CALENDAR_SCHEMA = [
    { key: "month", label: "Month", type: "text", placeholder: "e.g. Sep 2026" },
    { key: "campaign", label: "Campaign / Theme", type: "text" },
    { key: "assetType", label: "Asset Type", type: "text" },
    { key: "status", label: "Status", type: "select", options: CALENDAR_STATUS_OPTIONS },
    { key: "prepDeadline", label: "Prep Deadline", type: "date" },
    { key: "approvalDate", label: "Internal Approval Date", type: "date" },
    { key: "sendDate", label: "Send Date", type: "date" },
    { key: "branchesTargeted", label: "Branches Targeted", type: "text", placeholder: "e.g. All Onboarded Branches" },
    { key: "notes", label: "Notes", type: "textarea", span2: true }
  ];

  var ASSET_SCHEMA = [
    { key: "dateSent", label: "Date Sent", type: "date" },
    { key: "branchName", label: "Branch Name", type: "branchpicker" },
    { key: "assetName", label: "Asset Name", type: "text", span2: true },
    { key: "assetType", label: "Asset Type", type: "text" },
    { key: "campaign", label: "Campaign / Month", type: "text" },
    { key: "channel", label: "Channel", type: "select", options: CHANNEL_OPTIONS },
    { key: "sentBy", label: "Sent By", type: "text" },
    { key: "confirmed", label: "Confirmation Received", type: "select", options: CONFIRMED_OPTIONS },
    { key: "confirmDate", label: "Confirmation Date", type: "date" },
    { key: "fileId", nameKey: "fileName", label: "Attached File", type: "file", span2: true },
    { key: "notes", label: "Notes", type: "textarea", span2: true }
  ];

  var ENTITIES = {
    branches: { schema: BRANCH_SCHEMA, label: "Branch" },
    benefits: { schema: BENEFIT_SCHEMA, label: "Benefit" },
    calendar: { schema: CALENDAR_SCHEMA, label: "Campaign" },
    assets: { schema: ASSET_SCHEMA, label: "Asset" }
  };

  function esc(s) {
    if (s === undefined || s === null) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmtDate(s) {
    if (!s) return "";
    var d = new Date(s + "T00:00:00");
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
  }

  // ---- App state ----
  var activeTab = "dashboard";
  var searchQ = { branches: "", benefits: "", calendar: "", assets: "" };
  var confirmArmed = null; // "entity:id" armed for delete confirm
  var stateLoaded = false;
  var workspaceBranchId = "";
  var ALWAYS_FREE_TYPES = ["Social Media Feature", "Newsletter / Email Feature", "Mall Website Feature (Specials / What's On)"];
  var REMINDER_DAYS = 30;

  // ===================== Persistence (talks to the server API) =====================
  function setSaveIndicator(mode, text) {
    var el = document.getElementById("saveIndicator");
    var t = document.getElementById("saveText");
    if (!el || !t) return;
    el.className = "save-indicator " + mode;
    t.textContent = text;
  }

  function apiFetch(url, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    setSaveIndicator("saving", "Saving…");
    return fetch(url, opts).then(function (res) {
      if (res.status === 401) {
        window.location.href = "/login.html";
        throw new Error("Signed out");
      }
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          throw new Error(body.error || ("Request failed (" + res.status + ")"));
        });
      }
      setSaveIndicator("saved", "Saved");
      return res.status === 204 ? null : res.json();
    });
  }

  function apiCreate(entity, data) { return apiFetch("/api/" + entity, { method: "POST", body: JSON.stringify(data) }); }
  function apiUpdate(entity, id, data) { return apiFetch("/api/" + entity + "/" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify(data) }); }
  function apiDelete(entity, id) { return apiFetch("/api/" + entity + "/" + encodeURIComponent(id), { method: "DELETE" }); }
  function apiBulkCreate(entity, items) { return apiFetch("/api/" + entity + "/bulk", { method: "POST", body: JSON.stringify({ items: items }) }); }

  function uploadFile(file, entityType, entityId) {
    var fd = new FormData();
    fd.append("file", file);
    if (entityType) fd.append("entityType", entityType);
    if (entityId) fd.append("entityId", entityId);
    setSaveIndicator("saving", "Uploading…");
    return fetch("/api/files", { method: "POST", credentials: "include", body: fd }).then(function (res) {
      if (res.status === 401) { window.location.href = "/login.html"; throw new Error("Signed out"); }
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          throw new Error(body.error || "Upload failed");
        });
      }
      setSaveIndicator("saved", "Saved");
      return res.json();
    });
  }

  function fileLink(fileId, fileName) {
    if (!fileId) return "—";
    return '<a href="/api/files/' + encodeURIComponent(fileId) + '" target="_blank" rel="noopener">📎 ' + esc(fileName || "View file") + "</a>";
  }

  function handleApiError(err) {
    console.warn(err);
    setSaveIndicator("offline", "Save failed — " + (err && err.message ? err.message : "please try again"));
    toast("That didn't save. Please try again.");
  }

  function loadState() {
    setSaveIndicator("saving", "Loading…");
    return fetch("/api/state", { credentials: "include" })
      .then(function (res) {
        if (res.status === 401) { window.location.href = "/login.html"; throw new Error("Signed out"); }
        if (!res.ok) throw new Error("Failed to load data (" + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        STATE = data;
        stateLoaded = true;
        setSaveIndicator("saved", "Up to date");
      })
      .catch(function (err) {
        console.warn(err);
        setSaveIndicator("offline", "Could not load data — refresh to try again");
      });
  }

  // ===================== Toast =====================
  function toast(msg) {
    var root = document.getElementById("toastRoot");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    root.innerHTML = "";
    root.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2600);
  }

  // ===================== Pills =====================
  function stagePillClass(stage) {
    if (stage === "Onboarded - Active") return "pill-good";
    if (stage === "Declined / Not Applicable") return "pill-critical";
    if (stage === "On Hold" || !stage || stage === "Not Contacted") return "pill-neutral";
    return "pill-warn";
  }
  function costPillClass(cost) {
    if (!cost) return "pill-neutral";
    if (cost.indexOf("Free") === 0) return "pill-good";
    if (cost.indexOf("Paid") === 0) return "pill-warn";
    return "pill-neutral";
  }
  function benefitStatusPillClass(s) {
    if (s === "Confirmed") return "pill-good";
    if (s === "Pending Landlord Approval") return "pill-warn";
    if (s === "Expired") return "pill-critical";
    return "pill-neutral";
  }
  function calStatusPillClass(s) {
    if (s === "Sent" || s === "Complete") return "pill-good";
    if (s === "Approved") return "pill-accent2";
    if (s === "In Production") return "pill-warn";
    return "pill-neutral";
  }
  function confirmedPillClass(s) {
    if (s === "Yes") return "pill-good";
    if (s === "Pending") return "pill-warn";
    return "pill-neutral";
  }
  function pill(text, cls) { return '<span class="pill ' + cls + '">' + esc(text || "—") + "</span>"; }

  // ===================== Generic table =====================
  function renderTableSection(opts) {
    var q = searchQ[opts.entity] || "";
    var rows = opts.rows;
    var html = '<div class="section-head"><div><h2>' + esc(opts.title) + "</h2><p>" + esc(opts.desc) + '</p></div>' +
      '<div class="section-actions">' +
      '<input class="search-input" type="text" placeholder="Search…" value="' + esc(q) + '" data-role="search" data-entity="' + opts.entity + '">' +
      '<button class="btn btn-primary" data-action="add" data-entity="' + opts.entity + '">+ ' + esc(opts.addLabel) + "</button>" +
      "</div></div>";

    html += '<div class="table-wrap"><table class="data"><thead><tr>';
    opts.columns.forEach(function (c) { html += "<th>" + esc(c.label) + "</th>"; });
    html += '<th class="col-actions">Actions</th></tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr class="empty-row"><td colspan="' + (opts.columns.length + 1) + '">' +
        (q ? "No matches for “" + esc(q) + "”." : "Nothing here yet — click “+ " + esc(opts.addLabel) + "” to add the first one.") +
        "</td></tr>";
    } else {
      rows.forEach(function (row) {
        html += "<tr>";
        opts.columns.forEach(function (c) { html += "<td>" + (c.render ? c.render(row) : esc(row[c.key] || "—")) + "</td>"; });
        var confirmKey = opts.entity + ":" + row.id;
        var isArmed = confirmArmed === confirmKey;
        html += '<td class="col-actions">' +
          '<button class="btn btn-ghost btn-sm" data-action="edit" data-entity="' + opts.entity + '" data-id="' + esc(row.id) + '">Edit</button> ' +
          '<button class="btn ' + (isArmed ? "btn-danger" : "btn-ghost") + ' btn-sm" data-action="delete" data-entity="' + opts.entity + '" data-id="' + esc(row.id) + '">' +
          (isArmed ? "Confirm?" : "Delete") + "</button></td>";
        html += "</tr>";
      });
    }
    html += "</tbody></table></div>";
    return html;
  }

  function filterRows(entity, fields) {
    var q = (searchQ[entity] || "").toLowerCase().trim();
    var list = STATE[entity] || [];
    if (!q) return list;
    return list.filter(function (row) {
      return fields.some(function (f) { return (row[f] || "").toString().toLowerCase().indexOf(q) !== -1; });
    });
  }

  // ===================== Views =====================
  function viewBranches() {
    var rows = filterRows("branches", ["id", "name", "region", "manager", "email", "notes"]);
    var columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Branch" },
      { key: "region", label: "Region" },
      { key: "stage", label: "Stage", render: function (r) { return pill(r.stage || "Not Contacted", stagePillClass(r.stage)); } },
      { key: "manager", label: "Marketing Contact" },
      { key: "nextAction", label: "Next Action" },
      { key: "nextActionDate", label: "Due", render: function (r) { return esc(fmtDate(r.nextActionDate)) || "—"; } }
    ];
    return renderTableSection({
      entity: "branches", title: "Branch Contacts & Engagement Status",
      desc: "Every branch, its contact, and where it sits in the six-stage engagement process.",
      columns: columns, rows: rows, addLabel: "Add Branch"
    });
  }

  function viewBenefits() {
    var rows = filterRows("benefits", ["branchName", "benefitType", "costType", "details", "notes"]);
    var columns = [
      { key: "branchName", label: "Branch" },
      { key: "benefitType", label: "Benefit Type" },
      { key: "costType", label: "Cost Type", render: function (r) { return pill(r.costType, costPillClass(r.costType)); } },
      { key: "status", label: "Status", render: function (r) { return pill(r.status || "—", benefitStatusPillClass(r.status)); } },
      { key: "reviewDate", label: "Review", render: function (r) { return esc(fmtDate(r.reviewDate)) || "—"; } },
      { key: "fileId", label: "Doc", render: function (r) { return fileLink(r.fileId, r.fileName); } }
    ];
    return renderTableSection({
      entity: "benefits", title: "Lease-Based Marketing Benefits",
      desc: "What each branch's lease confirms — see Standard Defaults for the usual starting-point pattern.",
      columns: columns, rows: rows, addLabel: "Add Benefit"
    });
  }

  function viewCalendar() {
    var rows = filterRows("calendar", ["month", "campaign", "assetType", "branchesTargeted", "notes"]);
    var columns = [
      { key: "month", label: "Month" },
      { key: "campaign", label: "Campaign" },
      { key: "assetType", label: "Asset Type" },
      { key: "status", label: "Status", render: function (r) { return pill(r.status || "—", calStatusPillClass(r.status)); } },
      { key: "sendDate", label: "Send Date", render: function (r) { return esc(fmtDate(r.sendDate)) || "—"; } }
    ];
    return renderTableSection({
      entity: "calendar", title: "Monthly Content Calendar",
      desc: "Plan each month's campaign and asset list before anything is produced or sent.",
      columns: columns, rows: rows, addLabel: "Add Campaign"
    });
  }

  function viewAssets() {
    var rows = filterRows("assets", ["branchName", "assetName", "assetType", "campaign", "notes"]);
    var columns = [
      { key: "dateSent", label: "Sent", render: function (r) { return esc(fmtDate(r.dateSent)) || "—"; } },
      { key: "branchName", label: "Branch" },
      { key: "assetName", label: "Asset" },
      { key: "channel", label: "Channel" },
      { key: "confirmed", label: "Confirmed", render: function (r) { return pill(r.confirmed || "—", confirmedPillClass(r.confirmed)); } },
      { key: "fileId", label: "File", render: function (r) { return fileLink(r.fileId, r.fileName); } }
    ];
    return renderTableSection({
      entity: "assets", title: "Assets Sent Log",
      desc: "Every asset actually sent, to which branch, and whether it was confirmed received or displayed.",
      columns: columns, rows: rows, addLabel: "Log a Send"
    });
  }

  function daysAgo(dateStr) {
    if (!dateStr) return null;
    var d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }

  function viewWorkspace() {
    if (!stateLoaded) return '<div class="loading-note">Loading your data…</div>';

    var branches = STATE.branches.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    var html = '<div class="section-head"><div><h2>Branch Workspace</h2>' +
      "<p>Pick a branch to capture its marketing contact, log which lease benefits apply, and see its full history in one place.</p></div></div>";

    html += '<div class="ws-picker"><label for="workspaceBranchSelect">Branch</label>' +
      '<select id="workspaceBranchSelect" data-role="workspace-branch-select">' +
      '<option value="">Choose a branch…</option>' +
      branches.map(function (b) {
        return '<option value="' + esc(b.id) + '"' + (b.id === workspaceBranchId ? " selected" : "") + '>' + esc(b.name) + " — " + esc(b.region) + "</option>";
      }).join("") +
      "</select></div>";

    if (!workspaceBranchId) {
      html += '<div class="loading-note">Choose a branch above to get started.</div>';
      return html;
    }

    var branch = STATE.branches.find(function (b) { return b.id === workspaceBranchId; });
    if (!branch) {
      workspaceBranchId = "";
      html += '<div class="loading-note">That branch is no longer available.</div>';
      return html;
    }

    var branchBenefits = STATE.benefits.filter(function (x) { return x.branchName === branch.name; });
    var branchAssets = STATE.assets.filter(function (x) { return x.branchName === branch.name; })
      .sort(function (a, b) { return (b.dateSent || "").localeCompare(a.dateSent || ""); });

    // ---- Header ----
    html += '<div class="ws-header panel">' +
      '<div class="ws-header-top"><div><h3 style="margin-bottom:0.15rem;">' + esc(branch.name) + "</h3>" +
      '<p style="margin:0;color:var(--ink-3);font-size:0.82rem;">' + esc(branch.region) + " · " + esc(branch.address) + "</p></div>" +
      pill(branch.stage || "Not Contacted", stagePillClass(branch.stage)) +
      "</div>" +
      '<div class="ws-header-actions"><button class="btn btn-ghost btn-sm" data-action="edit" data-entity="branches" data-id="' + esc(branch.id) + '">Edit stage &amp; notes</button></div>' +
      "</div>";

    // ---- Marketing contact ----
    html += '<div class="panel"><h3>Marketing Contact</h3>' +
      '<p style="margin-top:-0.3rem;">Capture this the moment you start talking to a branch — it\'s the first thing you\'ll want on hand later.</p>' +
      '<div class="ws-contact-grid">' +
      '<div class="form-field"><label for="wsContactName">Contact Name</label><input type="text" id="wsContactName" value="' + esc(branch.manager) + '"></div>' +
      '<div class="form-field"><label for="wsContactEmail">Email</label><input type="text" id="wsContactEmail" value="' + esc(branch.email) + '"></div>' +
      '<div class="form-field"><label for="wsContactPhone">Phone</label><input type="text" id="wsContactPhone" value="' + esc(branch.phone) + '"></div>' +
      "</div>" +
      '<button class="btn btn-primary btn-sm" data-action="workspace-save-contact" data-id="' + esc(branch.id) + '" style="margin-top:0.8rem;">Save contact</button>' +
      "</div>";

    // ---- Lease benefits capture ----
    html += '<div class="panel"><h3>Lease Marketing Benefits</h3>' +
      '<p style="margin-top:-0.3rem;">Tick what applies to this branch — Social Media, Newsletter and Mall Website are pre-ticked since they\'re free in almost every lease. Add the rest as they\'re confirmed; different benefits often get confirmed at different times, so come back and tick more whenever.</p>';

    html += '<div class="ws-ratecard">' +
      (branch.rateCardFileId
        ? '<div>Rate card on file: ' + fileLink(branch.rateCardFileId, branch.rateCardFileName) + "</div>"
        : '<div style="color:var(--ink-3);font-size:0.85rem;">No rate card uploaded yet.</div>') +
      '<input type="file" id="wsRateCardFile" accept=".pdf,.jpg,.jpeg,.png,.webp">' +
      '<button class="btn btn-ghost btn-sm" data-action="workspace-upload-ratecard" data-id="' + esc(branch.id) + '">Upload rate card (PDF)</button>' +
      "</div>";

    html += '<div class="ws-default-list">';
    DEFAULTS.forEach(function (d, idx) {
      var captured = branchBenefits.find(function (b) { return b.benefitType === d.type; });
      if (captured) {
        html += '<div class="ws-default-row ws-default-row-captured">' +
          '<div class="ws-default-main"><strong>' + esc(d.type) + "</strong> " + pill(captured.status || "Confirmed", benefitStatusPillClass(captured.status)) + " " + pill(captured.costType, costPillClass(captured.costType)) + "</div>" +
          '<div class="ws-default-actions">' +
          '<button class="btn btn-ghost btn-sm" data-action="edit" data-entity="benefits" data-id="' + esc(captured.id) + '">Edit</button> ' +
          '<button class="btn btn-ghost btn-sm" data-action="delete" data-entity="benefits" data-id="' + esc(captured.id) + '">Delete</button>' +
          "</div></div>";
      } else {
        var preChecked = ALWAYS_FREE_TYPES.indexOf(d.type) !== -1;
        html += '<label class="ws-default-row ws-default-row-pick">' +
          '<input type="checkbox" data-role="default-check" data-index="' + idx + '"' + (preChecked ? " checked" : "") + ">" +
          '<div class="ws-default-main"><strong>' + esc(d.type) + "</strong> " + pill(d.cost, costPillClass(d.cost)) +
          '<p style="margin:0.25rem 0 0;font-size:0.82rem;">' + esc(d.means) + "</p></div>" +
          "</label>";
      }
    });
    html += "</div>";
    html += '<div class="ws-benefit-buttons">' +
      '<button class="btn btn-primary btn-sm" data-action="capture-defaults" data-id="' + esc(branch.id) + '">Capture ticked benefits</button> ' +
      '<button class="btn btn-ghost btn-sm" data-action="add" data-entity="benefits" data-prefill-branch="' + esc(branch.name) + '">+ Add a different benefit</button>' +
      "</div></div>";

    // ---- Assets sent history ----
    html += '<div class="panel"><h3>Assets Sent — History</h3>';
    if (!branchAssets.length) {
      html += '<p style="margin-top:-0.3rem;">Nothing logged for this branch yet.</p>';
    } else {
      html += '<div class="table-wrap"><table class="data"><thead><tr><th>Sent</th><th>Asset</th><th>Channel</th><th>Confirmed</th><th>File</th><th class="col-actions">Actions</th></tr></thead><tbody>';
      branchAssets.forEach(function (a) {
        html += "<tr><td>" + (esc(fmtDate(a.dateSent)) || "—") + "</td><td>" + esc(a.assetName || "—") + "</td><td>" + esc(a.channel || "—") + "</td><td>" +
          pill(a.confirmed || "—", confirmedPillClass(a.confirmed)) + "</td><td>" + fileLink(a.fileId, a.fileName) + '</td><td class="col-actions">' +
          '<button class="btn btn-ghost btn-sm" data-action="edit" data-entity="assets" data-id="' + esc(a.id) + '">Edit</button> ' +
          '<button class="btn btn-ghost btn-sm" data-action="delete" data-entity="assets" data-id="' + esc(a.id) + '">Delete</button></td></tr>';
      });
      html += "</tbody></table></div>";
    }
    html += '<button class="btn btn-primary btn-sm" data-action="add" data-entity="assets" data-prefill-branch="' + esc(branch.name) + '" style="margin-top:0.8rem;">+ Log a send</button></div>';

    return html;
  }

  function viewDefaults() {
    var html = '<div class="section-head"><div><h2>Standard Benefit Defaults</h2>' +
      '<p>A general starting-point pattern from common shopping-centre marketing rate cards. Use it as your working assumption before a branch meeting, then confirm and log the specifics in Lease Benefits.</p></div></div>';
    html += '<div class="defaults-grid">';
    DEFAULTS.forEach(function (d) {
      html += '<div class="default-card"><h4>' + esc(d.type) + "</h4>" +
        pill(d.cost, costPillClass(d.cost)) +
        '<p style="margin-top:0.6rem;">' + esc(d.means) + "</p>" +
        '<div class="field-label">Confirm at the meeting</div><p>' + esc(d.confirm) + "</p></div>";
    });
    html += "</div>";
    html += '<div class="panel notes-panel" style="margin-top:1.25rem;"><h3>General notes seen across mall marketing rate cards</h3><ul>';
    GENERAL_NOTES.forEach(function (n) { html += "<li>" + esc(n) + "</li>"; });
    html += "</ul></div>";
    return html;
  }

  function viewDashboard() {
    if (!stateLoaded) {
      return '<div class="loading-note">Loading your data…</div>';
    }
    var stageCounts = {};
    STAGE_OPTIONS.forEach(function (s) { stageCounts[s] = 0; });
    STATE.branches.forEach(function (b) { var s = b.stage || "Not Contacted"; stageCounts[s] = (stageCounts[s] || 0) + 1; });
    var totalBranches = STATE.branches.length || 1;

    var freeBenefits = STATE.benefits.filter(function (b) { return (b.costType || "").indexOf("Free") === 0; }).length;
    var paidBenefits = STATE.benefits.filter(function (b) { return (b.costType || "").indexOf("Paid") === 0; }).length;
    var confirmedBenefits = STATE.benefits.filter(function (b) { return b.status === "Confirmed"; }).length;

    var assetsSent = STATE.assets.length;
    var assetsConfirmed = STATE.assets.filter(function (a) { return a.confirmed === "Yes"; }).length;
    var assetsPending = STATE.assets.filter(function (a) { return a.confirmed === "Pending"; }).length;

    var campaigns = STATE.calendar.length;
    var campaignsSent = STATE.calendar.filter(function (c) { return c.status === "Sent" || c.status === "Complete"; }).length;

    var onboarded = stageCounts["Onboarded - Active"];

    var html = '<div class="section-head"><div><h2>Dashboard</h2><p>Live summary — pulled from Branches, Lease Benefits, Content Calendar and Assets Sent.</p></div></div>';

    var sendDates = STATE.calendar.map(function (c) { return c.sendDate; }).filter(Boolean).sort();
    var lastSend = sendDates.length ? sendDates[sendDates.length - 1] : null;
    var sinceLast = daysAgo(lastSend);
    if (sinceLast === null || sinceLast >= REMINDER_DAYS) {
      html += '<div class="callout">' +
        "<h4>" + (lastSend ? "It's been " + sinceLast + " days since your last logged campaign" : "No campaigns logged yet") + "</h4>" +
        "<p>Time to plan the next round of marketing activity and log it in the Content Calendar with a submission due date.</p>" +
        '<button class="btn btn-primary btn-sm" data-action="goto-tab" data-tab="calendar">Go to Content Calendar</button>' +
        "</div>";
    }

    html += '<div class="kpi-grid">' +
      kpiTile("Total Branches", STATE.branches.length) +
      kpiTile("Onboarded - Active", onboarded) +
      kpiTile("Free Benefits Found", freeBenefits, confirmedBenefits + " confirmed overall") +
      kpiTile("Paid Placements Found", paidBenefits) +
      kpiTile("Assets Sent", assetsSent, assetsConfirmed + " confirmed · " + assetsPending + " pending") +
      kpiTile("Campaigns Sent", campaignsSent, campaigns + " in calendar") +
      "</div>";

    html += '<div class="dash-grid">';
    html += '<div class="panel"><h3>Branch Engagement Pipeline</h3>';
    STAGE_OPTIONS.forEach(function (s) {
      var c = stageCounts[s];
      var pct = Math.round((c / totalBranches) * 100);
      html += barRow(s, c, pct, false);
    });
    html += "</div>";

    var regionCounts = {};
    STATE.branches.forEach(function (b) { var r = b.region || "Unspecified"; regionCounts[r] = (regionCounts[r] || 0) + 1; });
    var regionEntries = Object.keys(regionCounts).map(function (k) { return [k, regionCounts[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    var maxRegion = regionEntries.length ? regionEntries[0][1] : 1;
    html += '<div class="panel"><h3>Branches by Region</h3>';
    regionEntries.forEach(function (e) {
      html += barRow(e[0], e[1], Math.round((e[1] / maxRegion) * 100), true);
    });
    html += "</div>";
    html += "</div>";

    return html;
  }

  function kpiTile(label, value, sub) {
    return '<div class="kpi-tile"><div class="kpi-label">' + esc(label) + '</div><div class="kpi-value">' + esc(value) + "</div>" +
      (sub ? '<div class="kpi-sub">' + esc(sub) + "</div>" : "") + "</div>";
  }
  function barRow(label, count, pct, alt) {
    return '<div class="bar-row"><span class="bar-label">' + esc(label) + '</span>' +
      '<span class="bar-track"><span class="bar-fill' + (alt ? " alt" : "") + '" style="width:' + Math.max(pct, count > 0 ? 3 : 0) + '%"></span></span>' +
      '<span class="bar-count">' + esc(count) + "</span></div>";
  }

  // ===================== Render root =====================
  function render() {
    var tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(function (t) { t.classList.toggle("active", t.dataset.tab === activeTab); });
    var views = { dashboard: viewDashboard, workspace: viewWorkspace, branches: viewBranches, benefits: viewBenefits, calendar: viewCalendar, assets: viewAssets, defaults: viewDefaults };
    Object.keys(views).forEach(function (key) {
      var el = document.getElementById("view-" + key);
      if (key === activeTab) {
        el.hidden = false;
        el.innerHTML = views[key]();
      } else {
        el.hidden = true;
      }
    });
    refreshBranchDatalist();
  }

  function refreshBranchDatalist() {
    var dl = document.getElementById("branchNamesList");
    if (!dl) return;
    dl.innerHTML = (STATE.branches || []).map(function (b) { return '<option value="' + esc(b.name) + '"></option>'; }).join("");
  }

  // ===================== Modal / CRUD =====================
  function openModal(entity, id, prefill) {
    var conf = ENTITIES[entity];
    var isNew = !id;
    var row = isNew ? Object.assign({}, prefill || {}) : STATE[entity].find(function (r) { return r.id === id; });
    if (!row) return;
    var root = document.getElementById("modalRoot");
    var html = '<div class="modal-overlay" data-role="overlay"><div class="modal-panel" role="dialog" aria-modal="true">' +
      "<h3>" + (isNew ? "Add " : "Edit ") + esc(conf.label) + "</h3>" +
      '<form id="entityForm"><div class="form-grid">';

    conf.schema.forEach(function (f) {
      var val = row[f.key] || "";
      html += '<div class="form-field' + (f.span2 ? " span-2" : "") + '"><label for="f_' + f.key + '">' + esc(f.label) + "</label>";
      if (f.type === "select") {
        html += '<select id="f_' + f.key + '" name="' + f.key + '">' +
          (val ? "" : '<option value="">Select…</option>') +
          f.options.map(function (o) { return '<option value="' + esc(o) + '"' + (o === val ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") +
          "</select>";
      } else if (f.type === "textarea") {
        html += '<textarea id="f_' + f.key + '" name="' + f.key + '">' + esc(val) + "</textarea>";
      } else if (f.type === "date") {
        html += '<input type="date" id="f_' + f.key + '" name="' + f.key + '" value="' + esc(val) + '">';
      } else if (f.type === "branchpicker") {
        html += '<input type="text" id="f_' + f.key + '" name="' + f.key + '" value="' + esc(val) + '" list="branchNamesList" placeholder="Start typing a branch name…">';
      } else if (f.type === "file") {
        html += '<input type="file" id="f_' + f.key + '" accept=".pdf,.jpg,.jpeg,.png,.webp">' +
          (val ? '<div class="file-current">Current: ' + fileLink(val, row[f.nameKey]) + " — choosing a new file replaces it</div>" : "");
      } else {
        html += '<input type="text" id="f_' + f.key + '" name="' + f.key + '" value="' + esc(val) + '"' +
          (f.readonly ? " disabled" : "") + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "") + ">";
      }
      html += "</div>";
    });

    html += '</div><div class="modal-actions">' +
      '<button type="button" class="btn btn-ghost" data-role="cancel">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Save</button>' +
      "</div></form></div></div>";

    root.innerHTML = html;

    var form = document.getElementById("entityForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {};
      var fileFields = [];
      conf.schema.forEach(function (f) {
        if (f.readonly) return;
        if (f.type === "file") { fileFields.push(f); return; }
        var el = document.getElementById("f_" + f.key);
        data[f.key] = el ? el.value : "";
      });

      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving…";

      var pendingUploads = fileFields.map(function (f) {
        var el = document.getElementById("f_" + f.key);
        var chosen = el && el.files && el.files[0];
        if (!chosen) return Promise.resolve(null);
        return uploadFile(chosen, entity, row.id || "new").then(function (saved) {
          data[f.key] = saved.id;
          data[f.nameKey] = saved.filename;
        });
      });

      Promise.all(pendingUploads).then(function () {
        if (isNew) {
          return apiCreate(entity, data).then(function (created) {
            STATE[entity].push(created);
            toast(conf.label + " added");
            closeModal();
            render();
          });
        } else {
          return apiUpdate(entity, row.id, data).then(function (updated) {
            Object.assign(row, updated);
            toast(conf.label + " updated");
            closeModal();
            render();
          });
        }
      }).catch(function (err) {
        handleApiError(err);
        submitBtn.disabled = false;
        submitBtn.textContent = "Save";
      });
    });

    root.querySelector('[data-role="cancel"]').addEventListener("click", closeModal);
    root.querySelector('[data-role="overlay"]').addEventListener("click", function (e) {
      if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener("keydown", escListener);

    var firstInput = form.querySelector("input:not([disabled]), select, textarea");
    if (firstInput) firstInput.focus();
  }

  function escListener(e) { if (e.key === "Escape") closeModal(); }

  function closeModal() {
    document.getElementById("modalRoot").innerHTML = "";
    document.removeEventListener("keydown", escListener);
  }

  function deleteRow(entity, id) {
    var conf = ENTITIES[entity];
    apiDelete(entity, id).then(function () {
      STATE[entity] = STATE[entity].filter(function (r) { return r.id !== id; });
      confirmArmed = null;
      toast(conf.label + " deleted");
      render();
    }).catch(function (err) {
      handleApiError(err);
      confirmArmed = null;
      render();
    });
  }

  // ===================== Event delegation =====================
  function onMainClick(e) {
    var addBtn = e.target.closest('[data-action="add"]');
    if (addBtn) {
      var prefill = addBtn.dataset.prefillBranch ? { branchName: addBtn.dataset.prefillBranch } : null;
      openModal(addBtn.dataset.entity, null, prefill);
      return;
    }

    var editBtn = e.target.closest('[data-action="edit"]');
    if (editBtn) { openModal(editBtn.dataset.entity, editBtn.dataset.id); return; }

    var delBtn = e.target.closest('[data-action="delete"]');
    if (delBtn) {
      var key = delBtn.dataset.entity + ":" + delBtn.dataset.id;
      if (confirmArmed === key) {
        deleteRow(delBtn.dataset.entity, delBtn.dataset.id);
      } else {
        confirmArmed = key;
        render();
        setTimeout(function () { if (confirmArmed === key) { confirmArmed = null; render(); } }, 4000);
      }
      return;
    }

    var gotoBtn = e.target.closest('[data-action="goto-tab"]');
    if (gotoBtn) { activeTab = gotoBtn.dataset.tab; confirmArmed = null; render(); return; }

    var saveContactBtn = e.target.closest('[data-action="workspace-save-contact"]');
    if (saveContactBtn) {
      var branchId = saveContactBtn.dataset.id;
      var branchRow = STATE.branches.find(function (b) { return b.id === branchId; });
      if (!branchRow) return;
      var patch = {
        manager: (document.getElementById("wsContactName") || {}).value || "",
        email: (document.getElementById("wsContactEmail") || {}).value || "",
        phone: (document.getElementById("wsContactPhone") || {}).value || ""
      };
      saveContactBtn.disabled = true;
      apiUpdate("branches", branchId, patch).then(function (updated) {
        Object.assign(branchRow, updated);
        toast("Marketing contact saved");
        render();
      }).catch(function (err) {
        handleApiError(err);
        saveContactBtn.disabled = false;
      });
      return;
    }

    var uploadRateCardBtn = e.target.closest('[data-action="workspace-upload-ratecard"]');
    if (uploadRateCardBtn) {
      var rcBranchId = uploadRateCardBtn.dataset.id;
      var rcBranchRow = STATE.branches.find(function (b) { return b.id === rcBranchId; });
      var fileEl = document.getElementById("wsRateCardFile");
      var chosen = fileEl && fileEl.files && fileEl.files[0];
      if (!rcBranchRow || !chosen) { toast("Choose a file first"); return; }
      uploadRateCardBtn.disabled = true;
      uploadFile(chosen, "branches", rcBranchId).then(function (saved) {
        return apiUpdate("branches", rcBranchId, { rateCardFileId: saved.id, rateCardFileName: saved.filename });
      }).then(function (updated) {
        Object.assign(rcBranchRow, updated);
        toast("Rate card uploaded");
        render();
      }).catch(function (err) {
        handleApiError(err);
        uploadRateCardBtn.disabled = false;
      });
      return;
    }

    var captureBtn = e.target.closest('[data-action="capture-defaults"]');
    if (captureBtn) {
      var cBranchId = captureBtn.dataset.id;
      var cBranchRow = STATE.branches.find(function (b) { return b.id === cBranchId; });
      if (!cBranchRow) return;
      var checks = document.querySelectorAll('[data-role="default-check"]:checked');
      if (!checks.length) { toast("Tick at least one benefit first"); return; }
      var items = Array.prototype.map.call(checks, function (cb) {
        var d = DEFAULTS[Number(cb.dataset.index)];
        return {
          branchName: cBranchRow.name, benefitType: d.type, costType: d.cost, details: d.means,
          value: "", status: "Confirmed", meetingDate: "", reviewDate: "", capturedBy: "", notes: ""
        };
      });
      captureBtn.disabled = true;
      apiBulkCreate("benefits", items).then(function (created) {
        created.forEach(function (row) { STATE.benefits.push(row); });
        toast((created.length === 1 ? "1 benefit" : created.length + " benefits") + " captured");
        render();
      }).catch(function (err) {
        handleApiError(err);
        captureBtn.disabled = false;
      });
      return;
    }
  }

  function onMainChange(e) {
    var branchSelect = e.target.closest('[data-role="workspace-branch-select"]');
    if (branchSelect) {
      workspaceBranchId = branchSelect.value;
      render();
    }
  }

  function onMainInput(e) {
    var search = e.target.closest('[data-role="search"]');
    if (search) {
      searchQ[search.dataset.entity] = search.value;
      var view = document.getElementById("view-" + search.dataset.entity);
      view.innerHTML = ({ branches: viewBranches, benefits: viewBenefits, calendar: viewCalendar, assets: viewAssets })[search.dataset.entity]();
      var el = document.getElementById("view-" + search.dataset.entity).querySelector('[data-role="search"]');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }
  }

  function initTabs() {
    document.getElementById("tabs").addEventListener("click", function (e) {
      var btn = e.target.closest(".tab-btn");
      if (!btn) return;
      activeTab = btn.dataset.tab;
      confirmArmed = null;
      render();
    });
  }

  function initTopbarActions() {
    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        fetch("/api/logout", { method: "POST", credentials: "include" }).then(function () {
          window.location.href = "/login.html";
        });
      });
    }
    var exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        window.location.href = "/api/export";
      });
    }
  }

  function init() {
    initTabs();
    initTopbarActions();
    document.getElementById("main").addEventListener("click", onMainClick);
    document.getElementById("main").addEventListener("input", onMainInput);
    document.getElementById("main").addEventListener("change", onMainChange);
    render();
    loadState().then(render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
