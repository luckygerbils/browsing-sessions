/* eslint-env browser */
const url = new URL(location.href).searchParams.get("url");
document.title = url;

function copy() {
    navigator.clipboard.writeText(url);
    const successMessage = document.createElement("span");
    successMessage.className = "copy-success";
    successMessage.innerText = "Copied!";
    copyButton.replaceWith(successMessage);
}

const urlLink = document.getElementById("url");
urlLink.href = url;
urlLink.appendChild(document.createTextNode(url));
urlLink.addEventListener("click", copy);

const copyButton = document.getElementById("copy");
copyButton.addEventListener("click", copy);