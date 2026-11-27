// Pott player page (APE-Studio/pott#10).
//
// https://apestudios.app/pott/#<team link token>
// The token is read from the URL fragment, sent only in a POST body to the
// `team-view` / `report-payment` edge functions, and kept on this device
// with the last known view (localStorage). Everything shown comes from
// team-view, which never returns another player's open amount.
//
// A player not on the list writes their name and waits for the treasurer
// (`join-request`, APE-Studio/pott#81); once approved, the page shows them
// as if they had tapped their name.
//
// "Ik heb betaald" only tells the treasurer; Pott never moves money, so
// this page has no payment buttons, IBAN or payment links. The player says
// how much: everything open, half, or another amount up to what is open
// (APE-Studio/pott#54). Half is rounded down to the cent, as in the app.
//
// All text from the server is set with textContent, never as HTML.

(function () {
  "use strict";

  var API = "https://ljjxnjqsggaavlqezobv.supabase.co/functions/v1";
  var STORE = "pott.v1.";

  // ------------------------------------------------------------------ copy
  // nl is the source (canvas). de: needs review by a native speaker.
  var COPY = {
    nl: {
      locale: "nl-NL",
      title: "Pott — de teampot",
      kitty: "boetepot",
      hi_owe: "Hoi {name}, jij moet nog",
      hi_credit: "Hoi {name}, je hebt tegoed",
      hi_zero: "Hoi {name}, je staat op",
      all_paid: "Alles betaald. Mooi zo.",
      how_to_pay: "Betaal zoals altijd bij {treasurer}, de penningmeester: contant, Tikkie of bank. Laat het daarna even weten.",
      the_treasurer: "de penningmeester",
      i_paid: "Ik heb betaald",
      how_paid: "Hoe heb je betaald?",
      what_paid: "Wat heb je betaald?",
      amt_all: "Alles {amount}", amt_half: "Helft {amount}", amt_other: "Ander bedrag",
      amount: "Bedrag",
      amt_over: "Je moet nog {amount}. Meld dat of minder.",
      amt_part: "Een deel betaald? Meld wat je betaalde; de rest blijft open.",
      tell_amt: "Laat {treasurer} weten: {amount}",
      tell_amt_generic: "Laat de penningmeester weten: {amount}",
      amt_changed: "Dat lukte niet: je stand is net veranderd. Kijk het bedrag na en probeer het opnieuw.",
      cash: "Contant", tikkie: "Tikkie", bank: "Bank",
      selected: "geselecteerd",
      tell: "Laat het {treasurer} weten",
      tell_generic: "Laat het de penningmeester weten",
      only_note: "Dit is alleen een seintje. Betalen gaat buiten Pott om.",
      sent_title: "{treasurer} krijgt een seintje",
      sent_title_generic: "De penningmeester krijgt een seintje",
      sent_line: "{amount} via {method}. Je stand verandert zodra {treasurer} het heeft afgevinkt.",
      sent_line_generic: "{amount} via {method}. Je stand verandert zodra de penningmeester het heeft afgevinkt.",
      other: "anders",
      sending: "Even versturen…",
      rate_limited: "Je hebt het vandaag al gemeld. {treasurer} ziet het.",
      send_failed: "Versturen lukte niet. Probeer het zo nog eens.",
      more_fines: "Nog {n} boetes", more_items: "Nog {n} posten", more_one: "Nog 1 post",
      fewer: "Minder tonen",
      in_pot: "In de teampot",
      spent: "Uitgegeven",
      where_money: "Waar ging het geld heen?",
      nothing_spent: "Nog niets uitgegeven dit seizoen.",
      today: "vandaag", yesterday: "gisteren",
      fines_season: "{n} boetes dit seizoen",
      who: "Wie ben jij?",
      who_sub: "Tik op je naam, dan zie je wat je nog moet. Dit onthoudt je telefoon.",
      no_players: "De penningmeester heeft nog geen spelers toegevoegd.",
      pot_only: "Alleen de teampot bekijken",
      not_listed: "Sta je er niet bij? Schrijf je naam",
      write_title: "Hoe heet je?",
      write_sub: "{treasurer} ziet het en laat je erin.",
      your_name: "Je naam",
      ask_join: "Vraag om erbij te komen",
      cancel: "Annuleren",
      waiting_title: "Wachten op {treasurer}",
      waiting_sub: "Je vroeg om bij {team} te komen als {name}. Zodra {treasurer} je erin laat, zie je hier je stand.",
      declined_title: "{treasurer} heeft je niet toegelaten",
      declined_sub: "Kies je naam als die nu op de lijst staat, of vraag het {treasurer} in de groepsapp.",
      back_list: "Terug naar de lijst",
      other_name: "Kies een andere naam",
      name_invalid: "Schrijf je naam, maximaal 40 tekens.",
      too_many: "{treasurer} heeft veel aanmeldingen openstaan. Probeer het later nog eens.",
      ask_failed: "Versturen lukte niet. Probeer het zo nog eens.",
      pick_name: "Kies je naam",
      not_you: "Niet {name}? Kies een andere naam",
      dead_title: "Deze link werkt niet meer",
      dead_sub: "De penningmeester heeft een nieuwe link gemaakt. Vraag in de groepsapp om de nieuwe link.",
      offline: "Je bent offline. Dit was je stand om {time}:",
      offline_day: "Je bent offline. Dit was je stand op {time}:",
      no_net_title: "Geen internet",
      no_net_sub: "Probeer het opnieuw zodra je weer verbinding hebt.",
      error_title: "Pott is even niet bereikbaar",
      error_sub: "Probeer het zo nog eens.",
      retry: "Opnieuw proberen",
      no_link_title: "Open de link uit de groepsapp",
      no_link_sub: "Je penningmeester deelt een link naar jullie teampot. Open die, dan zie je hier je stand.",
      made_with: "Pott houdt de teampot bij. Betalen gaat buiten Pott om."
    },
    en: {
      locale: "en-GB",
      title: "Pott — the team kitty",
      kitty: "team kitty",
      hi_owe: "Hi {name}, you still owe",
      hi_credit: "Hi {name}, you have credit",
      hi_zero: "Hi {name}, you're at",
      all_paid: "All paid. Nice one.",
      how_to_pay: "Pay {treasurer}, the treasurer, the usual way: cash, Tikkie or bank. Then let them know.",
      the_treasurer: "the treasurer",
      i_paid: "I've paid",
      how_paid: "How did you pay?",
      what_paid: "What did you pay?",
      amt_all: "Everything {amount}", amt_half: "Half {amount}", amt_other: "Other amount",
      amount: "Amount",
      amt_over: "You owe {amount}. Report that or less.",
      amt_part: "Only paid part? Report what you paid; the rest stays open.",
      tell_amt: "Let {treasurer} know: {amount}",
      tell_amt_generic: "Let the treasurer know: {amount}",
      amt_changed: "That didn't go through: your balance just changed. Check the amount and try again.",
      cash: "Cash", tikkie: "Tikkie", bank: "Bank",
      selected: "selected",
      tell: "Let {treasurer} know",
      tell_generic: "Let the treasurer know",
      only_note: "This is only a heads-up. Paying happens outside Pott.",
      sent_title: "{treasurer} gets a heads-up",
      sent_title_generic: "The treasurer gets a heads-up",
      sent_line: "{amount} by {method}. Your balance changes once {treasurer} ticks it off.",
      sent_line_generic: "{amount} by {method}. Your balance changes once the treasurer ticks it off.",
      other: "other",
      sending: "Sending…",
      rate_limited: "You already sent this today. {treasurer} will see it.",
      send_failed: "Couldn't send that. Try again in a moment.",
      more_fines: "{n} more fines", more_items: "{n} more items", more_one: "1 more item",
      fewer: "Show less",
      in_pot: "In the team kitty",
      spent: "Spent",
      where_money: "Where did the money go?",
      nothing_spent: "Nothing spent this season yet.",
      today: "today", yesterday: "yesterday",
      fines_season: "{n} fines this season",
      who: "Who are you?",
      who_sub: "Tap your name to see what you still owe. Your phone remembers it.",
      no_players: "The treasurer hasn't added any players yet.",
      pot_only: "Just view the team kitty",
      not_listed: "Not on the list? Write your name",
      write_title: "What's your name?",
      write_sub: "{treasurer} sees it and lets you in.",
      your_name: "Your name",
      ask_join: "Ask to join",
      cancel: "Cancel",
      waiting_title: "Waiting for {treasurer}",
      waiting_sub: "You asked to join {team} as {name}. Once {treasurer} lets you in, you see your balance here.",
      declined_title: "{treasurer} didn't let you in",
      declined_sub: "Pick your name if it's on the list now, or ask {treasurer} in the group chat.",
      back_list: "Back to the list",
      other_name: "Pick another name",
      name_invalid: "Write your name, up to 40 letters.",
      too_many: "{treasurer} has a lot of requests to go through. Try again later.",
      ask_failed: "That didn't send. Try again in a moment.",
      pick_name: "Pick your name",
      not_you: "Not {name}? Pick another name",
      dead_title: "This link no longer works",
      dead_sub: "The treasurer made a new link. Ask for the new one in the group chat.",
      offline: "You're offline. This was your balance at {time}:",
      offline_day: "You're offline. This was your balance on {time}:",
      no_net_title: "No internet",
      no_net_sub: "Try again once you're back online.",
      error_title: "Pott can't be reached right now",
      error_sub: "Try again in a moment.",
      retry: "Try again",
      no_link_title: "Open the link from the group chat",
      no_link_sub: "Your treasurer shares a link to your team kitty. Open it to see your balance here.",
      made_with: "Pott keeps track of the team kitty. Paying happens outside Pott."
    },
    de: {
      locale: "de-DE",
      title: "Pott — die Mannschaftskasse",
      kitty: "Mannschaftskasse",
      hi_owe: "Hallo {name}, du musst noch",
      hi_credit: "Hallo {name}, du hast Guthaben",
      hi_zero: "Hallo {name}, du stehst bei",
      all_paid: "Alles bezahlt. Sehr gut.",
      how_to_pay: "Zahl wie immer bei {treasurer}, der Kasse: bar, per App oder Überweisung. Sag danach kurz Bescheid.",
      the_treasurer: "der Kasse",
      i_paid: "Ich habe bezahlt",
      how_paid: "Wie hast du bezahlt?",
      what_paid: "Was hast du bezahlt?",
      amt_all: "Alles {amount}", amt_half: "Hälfte {amount}", amt_other: "Anderer Betrag",
      amount: "Betrag",
      amt_over: "Du schuldest {amount}. Melde das oder weniger.",
      amt_part: "Nur einen Teil bezahlt? Melde, was du bezahlt hast; der Rest bleibt offen.",
      tell_amt: "{treasurer} Bescheid geben: {amount}",
      tell_amt_generic: "Der Kasse Bescheid geben: {amount}",
      amt_changed: "Das hat nicht geklappt: dein Stand hat sich gerade geändert. Prüf den Betrag und versuch es noch einmal.",
      cash: "Bar", tikkie: "Tikkie", bank: "Überweisung",
      selected: "ausgewählt",
      tell: "{treasurer} Bescheid sagen",
      tell_generic: "Der Kasse Bescheid sagen",
      only_note: "Das ist nur ein Hinweis. Bezahlt wird außerhalb von Pott.",
      sent_title: "{treasurer} bekommt einen Hinweis",
      sent_title_generic: "Die Kasse bekommt einen Hinweis",
      sent_line: "{amount} per {method}. Dein Stand ändert sich, sobald {treasurer} es abgehakt hat.",
      sent_line_generic: "{amount} per {method}. Dein Stand ändert sich, sobald es abgehakt ist.",
      other: "anders",
      sending: "Wird gesendet…",
      rate_limited: "Du hast es heute schon gemeldet. {treasurer} sieht es.",
      send_failed: "Senden hat nicht geklappt. Versuch es gleich noch einmal.",
      more_fines: "Noch {n} Strafen", more_items: "Noch {n} Posten", more_one: "Noch 1 Posten",
      fewer: "Weniger anzeigen",
      in_pot: "In der Kasse",
      spent: "Ausgegeben",
      where_money: "Wofür wurde das Geld ausgegeben?",
      nothing_spent: "Diese Saison noch nichts ausgegeben.",
      today: "heute", yesterday: "gestern",
      fines_season: "{n} Strafen diese Saison",
      who: "Wer bist du?",
      who_sub: "Tipp auf deinen Namen, dann siehst du, was du noch zahlen musst. Dein Handy merkt es sich.",
      no_players: "Die Kasse hat noch keine Spieler hinzugefügt.",
      pot_only: "Nur die Kasse ansehen",
      not_listed: "Nicht auf der Liste? Schreib deinen Namen",
      write_title: "Wie heißt du?",
      write_sub: "{treasurer} sieht es und nimmt dich auf.",
      your_name: "Dein Name",
      ask_join: "Beitritt anfragen",
      cancel: "Abbrechen",
      waiting_title: "Warten auf {treasurer}",
      waiting_sub: "Du hast gefragt, ob du als {name} zu {team} kommen kannst. Sobald {treasurer} dich aufnimmt, siehst du hier deinen Stand.",
      declined_title: "{treasurer} hat dich nicht aufgenommen",
      declined_sub: "Wähl deinen Namen, falls er jetzt auf der Liste steht, oder frag {treasurer} im Gruppenchat.",
      back_list: "Zurück zur Liste",
      other_name: "Anderen Namen wählen",
      name_invalid: "Schreib deinen Namen, höchstens 40 Zeichen.",
      too_many: "{treasurer} hat viele offene Anfragen. Versuch es später noch mal.",
      ask_failed: "Senden hat nicht geklappt. Versuch es gleich noch mal.",
      pick_name: "Namen wählen",
      not_you: "Nicht {name}? Anderen Namen wählen",
      dead_title: "Dieser Link funktioniert nicht mehr",
      dead_sub: "Die Kasse hat einen neuen Link erstellt. Frag in der Gruppe nach dem neuen Link.",
      offline: "Du bist offline. Das war dein Stand um {time}:",
      offline_day: "Du bist offline. Das war dein Stand am {time}:",
      no_net_title: "Kein Internet",
      no_net_sub: "Versuch es noch einmal, sobald du wieder online bist.",
      error_title: "Pott ist gerade nicht erreichbar",
      error_sub: "Versuch es gleich noch einmal.",
      retry: "Erneut versuchen",
      no_link_title: "Öffne den Link aus der Gruppe",
      no_link_sub: "Die Kasse teilt einen Link zu eurer Mannschaftskasse. Öffne ihn, dann siehst du hier deinen Stand.",
      made_with: "Pott führt die Mannschaftskasse. Bezahlt wird außerhalb von Pott."
    }
  };

  function pickLang() {
    var prefs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "en"];
    for (var i = 0; i < prefs.length; i++) {
      var base = String(prefs[i] || "").toLowerCase().split("-")[0];
      if (COPY[base]) return base;
    }
    return "en";
  }

  var lang = pickLang();
  var L = COPY[lang];
  document.documentElement.lang = lang;
  document.title = L.title;

  function t(key, vars) {
    var s = L[key] || COPY.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    }
    return s;
  }

  // --------------------------------------------------------------- helpers
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") n.className = v;
        else if (k === "text") n.textContent = v;
        else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function money(cents, currency) {
    try {
      return new Intl.NumberFormat(L.locale, { style: "currency", currency: currency || "EUR" })
        .format((cents || 0) / 100);
    } catch (e) {
      return (currency || "EUR") + " " + ((cents || 0) / 100).toFixed(2);
    }
  }

  var TZ = "Europe/Amsterdam";
  function dayKey(d) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  }
  function shortDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    var now = new Date();
    if (dayKey(d) === dayKey(now)) return t("today");
    if (dayKey(d) === dayKey(new Date(now.getTime() - 864e5))) return t("yesterday");
    var opts = { timeZone: TZ, weekday: "short", day: "numeric", month: "short" };
    if (d.getFullYear() !== now.getFullYear()) opts = { timeZone: TZ, day: "numeric", month: "short", year: "numeric" };
    return new Intl.DateTimeFormat(L.locale, opts).format(d).replace(/\./g, "");
  }
  function clock(iso) {
    var d = new Date(iso);
    var opts = { hour: "2-digit", minute: "2-digit" };
    if (dayKey(d) !== dayKey(new Date())) { opts.weekday = "short"; opts.day = "numeric"; opts.month = "short"; }
    return { sameDay: dayKey(d) === dayKey(new Date()), text: new Intl.DateTimeFormat(L.locale, opts).format(d) };
  }

  function firstName(name) { return String(name || "").trim().split(/\s+/)[0] || ""; }

  function crestText(name) {
    var w = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!w.length) return "P";
    if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
    return (w[0][0] + w[w.length - 1][0]).toUpperCase();
  }

  function applyTeamColour(hex) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex || "")) return;
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var lum = function (c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    var L1 = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
    var root = document.documentElement.style;
    root.setProperty("--team", hex);
    root.setProperty("--team-ink", L1 > 0.36 ? "#000000" : "#FFFFFF");
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }

  // ---------------------------------------------------------------- storage
  // Per token: { member_id, team_only, view, saved_at }. Never required.
  function load(token) {
    try { return JSON.parse(localStorage.getItem(STORE + token) || "null") || {}; } catch (e) { return {}; }
  }
  function save(token, data) {
    try { localStorage.setItem(STORE + token, JSON.stringify(data)); } catch (e) { /* private mode */ }
  }
  function forget(token) {
    try { localStorage.removeItem(STORE + token); } catch (e) { /* ignore */ }
  }

  // -------------------------------------------------------------------- api
  function post(path, body) {
    return fetch(API + "/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer"
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { status: res.status, data: data };
      });
    });
  }

  // ------------------------------------------------------------------ state
  var app = document.getElementById("app");
  var glow = document.querySelector(".glow");
  var token = (location.hash || "").replace(/^#/, "").split(/[?&]/)[0];
  var stored = {};
  var view = null;
  var offlineAt = null;
  var ui = { step: 0, method: "tikkie", choice: "all", otherText: "", clientId: null, sending: false, msg: null, showAll: false, sent: null };

  function show(nodes) {
    app.textContent = "";
    nodes.forEach(function (n) { if (n) app.appendChild(n); });
    window.scrollTo(0, 0);
  }

  function stateScreen(icon, title, sub, action) {
    glow.hidden = true;
    show([el("div", { class: "center state" }, [
      icon,
      el("h1", { class: "title2", text: title }),
      el("p", { class: "sub", text: sub }),
      action || null
    ])]);
  }

  var linkIcon = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "ico"); svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8"); svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("aria-hidden", "true"); svg.style.width = "32px"; svg.style.height = "32px";
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1M3 3l18 18");
    svg.appendChild(p);
    return el("div", { class: "av lg" }, [svg]);
  };

  function retryBtn() { return el("button", { class: "btn sec", type: "button", onclick: start, text: t("retry") }); }

  // ----------------------------------------------------------------- render
  function treasurer() { return view && view.team && view.team.treasurer_name ? firstName(view.team.treasurer_name) : null; }

  function header() {
    var team = view.team;
    var sub = (team.club_name ? team.club_name + " · " : "") + t("kitty");
    return el("div", { class: "head" }, [
      el("span", { class: "crest", "aria-hidden": "true", text: crestText(team.name) }),
      el("div", null, [el("p", { class: "t", text: team.name }), el("p", { class: "s", text: sub })])
    ]);
  }

  function render() {
    if (!view) return;
    applyTeamColour(view.team.color);
    glow.hidden = false;
    var picked = view.me;
    if (!picked && stored.request) return renderWaiting(stored.request);
    if (!picked && ui.writing) return renderWrite();
    if (!picked && !stored.team_only) return renderPicker();
    var nodes = [];
    if (offlineAt) {
      var c = clock(offlineAt);
      nodes.push(el("p", { class: "banner", role: "status", text: t(c.sameDay ? "offline" : "offline_day", { time: c.text }) }));
    }
    nodes.push(header());
    if (picked) nodes = nodes.concat(renderMe(picked));
    else nodes.push(renderPotHero());
    nodes = nodes.concat(renderTeam(!!picked));
    show(nodes);
  }

  function renderPicker() {
    var players = view.players || [];
    var list = players.length
      ? el("ul", { class: "list" }, players.map(function (p) {
          return el("li", null, [el("button", { class: "li", type: "button", onclick: function () { choose(p.id); } }, [
            el("span", { class: "av", "aria-hidden": "true", text: p.initials }),
            el("span", { class: "grow" }, [el("span", { class: "t", text: p.name })]),
            el("span", { class: "chev", "aria-hidden": "true", text: "›" })
          ])]);
        }))
      : el("p", { class: "card sub", text: t("no_players") });
    show([
      el("div", { class: "center pick" }, [
        el("span", { class: "crest lg", "aria-hidden": "true", text: crestText(view.team.name) }),
        el("p", { class: "foot", text: view.team.name }),
        el("h1", { class: "title2", text: t("who") }),
        el("p", { class: "sub", text: t("who_sub") })
      ]),
      list,
      // Not on the list (APE-Studio/pott#81): write it, the treasurer approves.
      el("button", { class: "btn sec", type: "button", onclick: function () { ui.writing = true; ui.msg = null; render(); }, text: t("not_listed") }),
      el("button", { class: "btn ghost", type: "button", onclick: potOnly, text: t("pot_only") })
    ]);
  }

  // ------------------------------------------------- join request (pott#81)
  // The browser keeps a random secret with the request; the server stores
  // only its hash, so only this browser can read the request back.
  function trName() { return treasurer() || t("the_treasurer"); }

  function renderWrite() {
    var input = el("input", { class: "field", id: "jr-name", type: "text", autocomplete: "name", maxlength: "40",
                              placeholder: t("your_name"), "aria-label": t("your_name") });
    input.value = ui.nameText || "";
    input.addEventListener("input", function () { ui.nameText = input.value; });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") sendRequest(); });
    show([
      el("div", { class: "center pick" }, [
        el("span", { class: "crest lg", "aria-hidden": "true", text: crestText(view.team.name) }),
        el("p", { class: "foot", text: view.team.name }),
        el("h1", { class: "title2", text: t("write_title") }),
        el("p", { class: "sub", text: t("write_sub", { treasurer: trName() }) })
      ]),
      input,
      ui.msg ? el("p", { class: "sub", role: "alert", text: ui.msg }) : null,
      el("button", { class: "btn", type: "button", onclick: sendRequest, disabled: ui.sending ? "" : null,
                     text: ui.sending ? t("sending") : t("ask_join") }),
      el("button", { class: "btn ghost", type: "button", onclick: function () { ui.writing = false; ui.msg = null; render(); }, text: t("cancel") })
    ]);
    if (!ui.sending) input.focus();
  }

  function renderWaiting(req) {
    var declined = req.status === "declined";
    show([
      el("div", { class: "center pick" }, [
        el("span", { class: "crest lg", "aria-hidden": "true", text: crestText(view.team.name) }),
        el("p", { class: "foot", text: view.team.name }),
        el("h1", { class: "title2", text: t(declined ? "declined_title" : "waiting_title", { treasurer: trName() }) }),
        el("p", { class: "sub", text: declined
          ? t("declined_sub", { treasurer: trName() })
          : t("waiting_sub", { treasurer: trName(), team: view.team.name, name: req.name }) })
      ]),
      el("button", { class: declined ? "btn" : "btn ghost", type: "button", onclick: dropRequest,
                     text: t(declined ? "back_list" : "other_name") })
    ]);
  }

  function newSecret() {
    var b = new Uint8Array(32); crypto.getRandomValues(b);
    return btoa(String.fromCharCode.apply(null, b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function sendRequest() {
    var name = String(ui.nameText || "").trim();
    if (ui.sending || !view) return;
    if (!name || name.length > 40) { ui.msg = t("name_invalid"); return render(); }
    var secret = (stored.request && stored.request.secret) || newSecret();
    ui.sending = true; ui.msg = null; render();
    post("join-request", { action: "request", token: token, name: name, secret: secret })
      .then(function (r) {
        ui.sending = false;
        if (r.status === 200 && r.data && r.data.request) {
          stored.request = { id: r.data.request.id, name: r.data.request.name, status: r.data.request.status, secret: secret };
          stored.view = view; save(token, stored);
          ui.writing = false; ui.nameText = "";
        } else if (r.status === 404) {
          return dead();
        } else if (r.status === 422) {
          ui.msg = t("name_invalid");
        } else if (r.status === 429) {
          ui.msg = t("too_many", { treasurer: trName() });
        } else {
          ui.msg = t("ask_failed");
        }
        render();
      })
      .catch(function () { ui.sending = false; ui.msg = t("ask_failed"); render(); });
  }

  // Approved: this browser is that player from now on, as if the name was tapped.
  function checkRequest() {
    var req = stored.request;
    if (!req || req.status !== "pending") return;
    post("join-request", { action: "status", token: token, request_id: req.id, secret: req.secret })
      .then(function (r) {
        if (stored.request !== req) return;
        if (r.status === 200 && r.data && r.data.request) {
          var got = r.data.request;
          if (got.status === "approved" && got.member_id) {
            delete stored.request;
            return choose(got.member_id);
          }
          req.status = got.status;
          save(token, stored);
          render();
        } else if (r.status === 404 && r.data && r.data.error === "request_unknown") {
          dropRequest();
        }
      })
      .catch(function () { /* offline: try again on the next visit */ });
  }

  function dropRequest() {
    delete stored.request;
    save(token, stored);
    render();
  }

  function renderPotHero() {
    return el("h1", { class: "balance" }, [
      el("span", { class: "eyebrow", text: t("in_pot") }),
      el("span", { class: "hero", text: money(view.pot.pot_cents, view.team.currency) })
    ]);
  }

  function renderMe(me) {
    var cur = view.team.currency;
    var name = firstName(me.name);
    var out = [];
    var heading, amount, cls = "";
    if (me.open_cents > 0) { heading = t("hi_owe", { name: name }); amount = money(me.open_cents, cur); }
    else if (me.credit_cents > 0) { heading = t("hi_credit", { name: name }); amount = money(me.credit_cents, cur); cls = " credit"; }
    else { heading = t("hi_zero", { name: name }); amount = money(0, cur); cls = " paid"; }
    out.push(el("h1", { class: "balance" }, [
      el("span", { class: "eyebrow", text: heading }),
      el("span", { class: "hero" + cls, text: amount })
    ]));

    var tr = treasurer();
    var report = ui.sent || me.report;
    var card;
    if (report) {
      card = el("div", { class: "card", role: "status" }, [
        el("div", { class: "rowx" }, [checkIcon(), el("h2", { class: "h3", text: tr ? t("sent_title", { treasurer: tr }) : t("sent_title_generic") })]),
        el("p", { class: "sub", text: tr
          ? t("sent_line", { amount: money(report.amount_cents, cur), method: methodName(report.method), treasurer: tr })
          : t("sent_line_generic", { amount: money(report.amount_cents, cur), method: methodName(report.method) }) })
      ]);
    } else if (me.open_cents > 0 && !offlineAt) {
      if (ui.step === 0) {
        card = el("div", { class: "card" }, [
          el("p", { class: "sub strong", text: t("how_to_pay", { treasurer: tr || t("the_treasurer") }) }),
          el("button", { class: "btn", type: "button", onclick: function () { ui.step = 1; ui.clientId = uuid(); render(); }, text: t("i_paid") })
        ]);
      } else {
        card = reportCard(me, tr);
      }
    } else if (me.open_cents <= 0) {
      card = el("div", { class: "card" }, [el("p", { class: "sub", text: t("all_paid") })]);
    }
    if (card) out.push(card);

    var items = me.items || [];
    if (items.length) {
      var limit = ui.showAll || items.length <= 3 ? items.length : 2;
      var rows = items.slice(0, limit).map(function (it) {
        var amt = it.open_cents < it.amount_cents ? money(it.open_cents, cur) : money(it.amount_cents, cur);
        return el("li", { class: "li" }, [
          el("span", { class: "grow" }, [el("span", { class: "t", text: it.label }), el("span", { class: "s", text: shortDate(it.occurred_at) })]),
          el("span", { class: "amt", text: amt })
        ]);
      });
      if (limit < items.length) {
        var rest = items.slice(limit);
        var n = rest.length;
        var allFines = rest.every(function (i) { return i.kind === "fine"; });
        var label = n === 1 ? t("more_one") : t(allFines ? "more_fines" : "more_items", { n: n });
        rows.push(el("li", null, [el("button", { class: "li", type: "button", "aria-expanded": "false",
          onclick: function () { ui.showAll = true; render(); } }, [
          el("span", { class: "grow" }, [el("span", { class: "t", text: label })]),
          el("span", { class: "amt", text: money(rest.reduce(function (s, i) { return s + i.open_cents; }, 0), cur) }),
          el("span", { class: "chev", "aria-hidden": "true", text: "›" })
        ])]));
      }
      out.push(el("ul", { class: "list" }, rows));
    }
    return out;
  }

  function renderTeam(picked) {
    var cur = view.team.currency;
    var out = [];
    var tiles = [];
    if (picked) tiles.push(el("div", { class: "card" }, [el("p", { class: "foot", text: t("in_pot") }), el("span", { class: "amt big", text: money(view.pot.pot_cents, cur) })]));
    tiles.push(el("div", { class: "card" }, [el("p", { class: "foot", text: t("spent") }), el("span", { class: "amt big", text: money(view.pot.spent_cents, cur) })]));
    if (!picked) tiles.push(el("div", { class: "card" }, [el("p", { class: "foot", text: view.team.season }), el("span", { class: "amt big", text: String(view.pot.fine_count) }), el("p", { class: "foot", text: t("fines_season", { n: view.pot.fine_count }).replace(/^\d+\s*/, "") })]));
    out.push(el("div", { class: "grid2" }, tiles));
    out.push(el("h2", { class: "h3 section", text: t("where_money") }));
    var ex = view.expenses || [];
    out.push(ex.length
      ? el("ul", { class: "list" }, ex.map(function (x) {
          return el("li", { class: "li" }, [
            el("span", { class: "grow" }, [el("span", { class: "t", text: x.label }), el("span", { class: "s", text: shortDate(x.occurred_at) })]),
            el("span", { class: "amt", text: "− " + money(x.amount_cents, cur) })
          ]);
        }))
      : el("p", { class: "card sub", text: t("nothing_spent") }));
    if (picked) {
      out.push(el("button", { class: "btn ghost", type: "button", onclick: changeName, text: t("not_you", { name: firstName(view.me.name) }) }));
    } else {
      out.push(el("button", { class: "btn ghost", type: "button", onclick: changeName, text: t("pick_name") }));
    }
    out.push(el("p", { class: "foot tc", text: t("made_with") }));
    return out;
  }

  // "I've paid", step 2: how much, how, then the heads-up. The amount on
  // the button is the amount sent.
  function reportCard(me, tr) {
    var cur = view.team.currency;
    var open = me.open_cents;
    var half = halfCents(open);
    if (ui.choice === "half" && half <= 0) ui.choice = "all";
    var chip = function (key, label, disabled) {
      return el("button", { class: "chip", type: "button", "aria-pressed": ui.choice === key ? "true" : "false", disabled: disabled,
        onclick: function () { ui.choice = key; ui.msg = null; render(); if (key === "other") focusAmount(); }, text: label });
    };
    var input = null, hint = null;
    if (ui.choice === "other") {
      input = el("input", { class: "field", id: "amount", type: "text", inputmode: "decimal", autocomplete: "off",
        placeholder: money(0, cur), value: ui.otherText, "aria-label": t("amount") });
      hint = el("p", { class: "foot", text: t("amt_part") });
    }
    var button = el("button", { class: "btn", type: "button", onclick: sendReport });
    var paint = function () {
      var cents = chosenCents(open);
      var ok = cents > 0 && cents <= open;
      button.disabled = ui.sending || !ok;
      button.textContent = ui.sending ? t("sending")
        : ok ? (tr ? t("tell_amt", { treasurer: tr, amount: money(cents, cur) }) : t("tell_amt_generic", { amount: money(cents, cur) }))
        : (tr ? t("tell", { treasurer: tr }) : t("tell_generic"));
      if (hint) {
        var over = cents > open;
        hint.textContent = over ? t("amt_over", { amount: money(open, cur) }) : t("amt_part");
        hint.className = over ? "foot err" : "foot";
      }
    };
    // Typing updates the button in place, so the field keeps its focus.
    if (input) input.addEventListener("input", function () { ui.otherText = input.value; paint(); });
    paint();
    return el("div", { class: "card" }, [
      el("h2", { class: "h3", text: t("what_paid") }),
      el("div", { class: "rowx", role: "group", "aria-label": t("what_paid") }, [
        chip("all", t("amt_all", { amount: money(open, cur) })),
        chip("half", t("amt_half", { amount: money(half, cur) }), half <= 0),
        chip("other", t("amt_other"))
      ]),
      input, hint,
      el("h2", { class: "h3", text: t("how_paid") }),
      el("div", { class: "rowx", role: "group", "aria-label": t("how_paid") }, ["cash", "tikkie", "bank"].map(function (m) {
        return el("button", { class: "chip", type: "button", "aria-pressed": ui.method === m ? "true" : "false",
          onclick: function () { ui.method = m; render(); }, text: t(m) });
      })),
      button,
      ui.msg ? el("p", { class: "sub err", role: "alert", text: ui.msg }) : null,
      el("p", { class: "foot", text: t("only_note") })
    ]);
  }

  function focusAmount() {
    var f = document.getElementById("amount");
    if (f) f.focus();
  }

  // Half of what is open, rounded down to the cent: half plus what stays
  // open always equals the open amount (AmountChoice.halfCents in the app).
  function halfCents(open) { return Math.floor(Math.max(open, 0) / 2); }

  function chosenCents(open) {
    if (ui.choice === "half") return halfCents(open);
    if (ui.choice === "other") return parseCents(ui.otherText);
    return open;
  }

  // "9,50", "9.50", "€ 9", "1.234,50" → cents; anything else → 0.
  function parseCents(text) {
    var s = String(text || "").replace(/[^0-9.,]/g, "");
    if (!s) return 0;
    var m = s.match(/^(.*?)[.,](\d{1,2})$/);
    var whole = (m ? m[1] : s).replace(/[.,]/g, "");
    var frac = m ? (m[2] + "0").slice(0, 2) : "00";
    if (!/^\d*$/.test(whole) || whole.length > 7) return 0;
    return parseInt(whole || "0", 10) * 100 + parseInt(frac, 10);
  }

  // Mid-sentence: "via contant", "via Tikkie" (a brand); German nouns keep their capital.
  function methodName(m) {
    var name = m === "cash" || m === "tikkie" || m === "bank" ? t(m) : t("other");
    return lang === "de" || m === "tikkie" ? name : name.toLowerCase();
  }

  function checkIcon() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "ico paid"); svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2.4"); svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(ns, "path"); p.setAttribute("d", "M5 12.5l4.5 4.5L19 7.5"); svg.appendChild(p);
    return svg;
  }

  // ---------------------------------------------------------------- actions
  function choose(memberId) {
    stored = { member_id: memberId, team_only: false };
    save(token, stored);
    resetUi();
    fetchView();
  }
  function potOnly() {
    stored = { team_only: true, view: view, saved_at: view && view.as_of };
    save(token, stored);
    render();
  }
  function changeName() {
    stored = { view: null };
    forget(token);
    resetUi();
    if (view) { view.me = null; renderPicker(); } else start();
  }
  function resetUi() { ui = { step: 0, method: "tikkie", choice: "all", otherText: "", clientId: null, sending: false, msg: null, showAll: false, sent: null, writing: false, nameText: "" }; }

  function sendReport() {
    if (ui.sending || !view || !view.me) return;
    var cents = chosenCents(view.me.open_cents);
    if (!(cents > 0 && cents <= view.me.open_cents)) return;
    ui.sending = true; ui.msg = null; render();
    post("report-payment", { token: token, member_id: view.me.id, method: ui.method, client_id: ui.clientId, amount_cents: cents })
      .then(function (r) {
        ui.sending = false;
        if (r.status === 200 && r.data && r.data.report) {
          ui.sent = r.data.report;
          view.me.report = r.data.report;
          stored.view = view; save(token, stored);
        } else if (r.status === 404) {
          return dead();
        } else if (r.status === 429) {
          ui.msg = t("rate_limited", { treasurer: treasurer() || t("the_treasurer") });
        } else if (r.status === 422 && r.data && r.data.error === "amount_invalid") {
          // What is open changed meanwhile: show the new amount, keep the card open.
          ui.msg = t("amt_changed"); ui.choice = "all"; ui.clientId = uuid();
          return fetchView();
        } else if (r.status === 409 || r.status === 422) {
          return fetchView();
        } else {
          ui.msg = t("send_failed");
        }
        render();
      })
      .catch(function () { ui.sending = false; ui.msg = t("send_failed"); render(); });
  }

  function dead() {
    forget(token);
    stateScreen(linkIcon(), t("dead_title"), t("dead_sub"));
  }

  function fetchView() {
    var body = { token: token };
    if (stored.member_id) body.member_id = stored.member_id;
    return post("team-view", body).then(function (r) {
      if (r.status === 200 && r.data && r.data.team) {
        view = r.data;
        offlineAt = null;
        if (view.member_unknown) { stored.member_id = null; }
        stored.view = view; stored.saved_at = view.as_of;
        if (stored.member_id || stored.team_only || stored.request) save(token, stored);
        render();
        checkRequest();
      } else if (r.status === 404) {
        dead();
      } else if (stored.view) {
        // Server trouble: show what we last knew, marked with its time.
        view = stored.view; offlineAt = stored.saved_at || view.as_of; render();
      } else {
        stateScreen(null, t("error_title"), t("error_sub"), retryBtn());
      }
    }).catch(function () {
      if (stored.view) {
        view = stored.view; offlineAt = stored.saved_at || view.as_of; render();
      } else {
        stateScreen(null, t("no_net_title"), t("no_net_sub"), retryBtn());
      }
    });
  }

  function start() {
    token = (location.hash || "").replace(/^#/, "").split(/[?&]/)[0];
    if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) {
      return stateScreen(null, t("no_link_title"), t("no_link_sub"));
    }
    stored = load(token);
    view = null;
    resetUi();
    if (stored.view) { view = stored.view; render(); } // paint the last known view while loading
    fetchView();
  }

  window.addEventListener("hashchange", start);
  window.addEventListener("online", function () { if (offlineAt) fetchView(); });
  // Back on the page while waiting for the treasurer: ask again.
  document.addEventListener("visibilitychange", function () { if (!document.hidden) checkRequest(); });
  start();
})();
