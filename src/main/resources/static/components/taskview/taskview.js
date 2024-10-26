/**
 * 
 */
const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css"
        href="${import.meta.url.match(/.*\//)[0]}/taskview.css"/>
    <h1>Tasks</h1>
    <div id="message"><p>Waiting for server data.</p></div>
    <div id="newtask">
        <button type="button" disabled>New task</button>
    </div>
    <!-- The task list -->
    <task-list></task-list>
    
    <!-- The Modal -->
    <task-box></task-box>
`;

class TaskView extends HTMLElement {
    #tasklist
    #taskbox
    #dataserviceurl
    #statuseslist

    constructor() {
        super();
        const content = template.content.cloneNode(true);

        // save the tasklist and taskbox elements for easier access
        this.#tasklist = content.querySelector("task-list");
        this.#taskbox = content.querySelector("task-box");

        console.log(`task-list: ${this.#tasklist} - task-box: ${this.#taskbox}`)

        // save the url from the attribute
        this.#dataserviceurl = this.getAttribute("data-serviceurl") || "./api";

        // add click handler to the new task button
        const btn = content.querySelector("#newtask>button");
        btn.addEventListener("click", () => {
            this.#taskbox.show();
        });
        // enable button
        content.querySelector("button").disabled = false;

        this.appendChild(content);

        this.#updateStatusList();

        this.#tasklist.changestatusCallback(
            (id, newStatus) => {
                console.log(`id: ${id} - newStatus: ${newStatus}`);
                fetch(`${this.#dataserviceurl}/task/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Charset": "utf-8"
                    },
                    body: JSON.stringify({ "status": newStatus })
                }).then(
                    response => {
                        if (response.ok) {
                            response.json().then(json => {
                                if (json["responseStatus"] === true) {
                                    this.#tasklist.updateTask({ "id": json.id, "status": json.status });
                                }
                            })
                        } else {
                            throw new Error("Som ting wong");
                        }
                    });
            });

        this.#taskbox.newtaskCallback((title, status) => {
            fetch(`${this.#dataserviceurl}/task`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Charset": "utf-8"
                },
                body: JSON.stringify({ "title": title, "status": status })
            }).then(response => {
                if (response.ok) {
                    response.json().then(json => {
                        if (json["responseStatus"] === true) {
                            this.#tasklist.showTask(json["task"]);
                        }
                    });
                } else {
                    throw new Error("Som ting wong");
                }
            })
        });

        this.#tasklist.deletetaskCallback((id) => {
            fetch(`${this.#dataserviceurl}/task/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Charset": "utf-8"
                }
            }).then(response => {
                if (response.ok) {
                    response.json().then(json => {
                        if (json["responseStatus"] === true) {
                            this.#tasklist.removeTask(json["id"]);
                        }
                    });
                } else {
                    throw new Error("Som ting wong");
                }
            })
        });

        this.#updateTaskList();

    }

    /**
     * Updates the list of statuses used by the internal task-list and task-box elements
     */
    #updateStatusList() {
        fetch(`${this.#dataserviceurl}/allstatuses`)
            .then(response => {
                if (response.ok) {
                    response.json().then(json => {
                        if (json.allstatuses) {
                            this.#statuseslist = json.allstatuses;
                            // console.log(this.#statuseslist);
                            this.#tasklist.setStatuseslist(this.#statuseslist);
                            this.#taskbox.setStatusesList(this.#statuseslist);
                        }

                    });
                } else {
                    throw new Error("Could not connect to server");
                }
            });
    }

    /**
     * Fetches the list of tasks from the server
     */
    #updateTaskList() {
        fetch(`${this.#dataserviceurl}/tasklist`)
            .then(response => {
                if (response.ok) {
                    response.json().then(json => {
                        if (json.tasks) {
                            this.querySelector("#message>p").innerText = `Found ${json.tasks.length} tasks.`
                            for (const task of json.tasks) {
                                this.#tasklist.showTask(task);
                            }
                        }
                    });
                } else {
                    throw new Error("Could not connect to server");
                }
            });

    }

}

customElements.define('task-view', TaskView);