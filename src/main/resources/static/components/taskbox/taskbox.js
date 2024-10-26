/**
 * 
 */
const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css"
        href="${import.meta.url.match(/.*\//)[0]}/taskbox.css"/>
    <dialog>
        <!-- Modal content -->
        <span>&times;</span>
        <div>
            <div>Title:</div>
            <div>
                <input type="text" size="25" maxlength="80"
                    placeholder="Task title" autofocus/>
            </div>
            <div>Status:</div><div><select></select></div>
        </div>
        <p><button type="submit">Add task</button></p>
    </dialog>
`;

class TaskBox extends HTMLElement {
    #dialog
    #callbackForAddTask

    constructor() {
        super();

        const content = template.content.cloneNode(true);
        this.#dialog = content.querySelector("dialog");

        // make sure the "x" in the dialog modal closes it (like ESC key would)
        content.querySelector("span").addEventListener("click", () => {
            this.#dialog.close();
        })
        this.appendChild(content);
    }

    newtaskCallback(callback) {
        this.#callbackForAddTask = callback;
        const btn = this.querySelector("button");
        const input = this.querySelector("input");
        const select = this.querySelector("select");
        btn.addEventListener("click", () => {
            const title = input.value;
            const status = select.value;

            console.log(`title: ${title} - status: ${status}`);
            this.#callbackForAddTask(title, status);
            this.close();

        })
    }

    setStatusesList(list) {
        if (!Array.isArray(list)) {
            console.error(`${list} is not a valid array`);
            return;
        }
        if (list.length < 1) {
            console.error("The status array must contain atleast one status");
            return;
        }
        const select = this.querySelector("select");
        for (let status of list) {
            const elm = document.createElement("option");
            elm.value = status;
            elm.innerText = status;
            select.appendChild(elm);
        }
    }

    show() {
        this.#dialog.showModal();
    }

    close() {
        this.#dialog.close();
        this.querySelector("input").value = "";
        this.querySelector("select").value = "";
    }
}

customElements.define('task-box', TaskBox);