import { calculateConfiguration, validateConfiguration } from "./configurator-core.js";

const form = document.querySelector("#config-form");
const errorsBox = document.querySelector("#errors");
const emptyState = document.querySelector("#empty-state");
const resultContent = document.querySelector("#result-content");

const currency = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  data.width = Number(data.width);
  data.height = Number(data.height);
  data.quantity = Number(data.quantity);

  const errors = validateConfiguration(data);
  errorsBox.hidden = errors.length === 0;
  errorsBox.innerHTML = errors.length ? `<strong>Sprawdź dane:</strong><ul>${errors.map((error) => `<li>${error}</li>`).join("")}</ul>` : "";
  if (errors.length) {
    resultContent.hidden = true;
    emptyState.hidden = false;
    errorsBox.focus();
    return;
  }

  const result = calculateConfiguration(data);
  document.querySelector("#result-summary").textContent = result.summary;
  document.querySelector("#net-total").textContent = currency.format(result.netTotal);
  document.querySelector("#gross-total").textContent = currency.format(result.grossTotal);
  document.querySelector("#parts-list").innerHTML = result.parts.map((part) => `<li><span>${part.name}</span><code>${part.code}</code></li>`).join("");
  emptyState.hidden = true;
  resultContent.hidden = false;
});
