const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/tasklist.css"/>

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
   </tr>`;

/**
  * TaskList
  * Manage view with list of tasks
  */
class TaskList extends HTMLElement {

    constructor() {
        super();
        
        this.shadow = this.attachShadow({mode: 'closed'});
        this.shadow.appendChild(template.content.cloneNode(true));
        
        this.taskListElement = this.shadow.querySelector('#tasklist');
        this.taskListElement.appendChild(tasktable.content.cloneNode(true));
        
        this.tasks = [];
        this.statuses = [];
        this.changeCallback = null;
        this.deleteCallback = null;

        
        this.shadow.addEventListener('change', (event) => {
                          if (event.target.tagName === 'SELECT') {
                              const selectElement = event.target;
                              const row = selectElement.closest('tr');
                              const taskId = row.getAttribute('data-id');  // Anta ID-en er i første kolonne
                              const newStatus = selectElement.value;

                              const confirmation = window.confirm(`Set '${taskId}' to ${newStatus}?`);
                              if (confirmation && this.changeCallback) {
                                  this.changeCallback(taskId, newStatus);
                              }
                          }
                      });

                             this.shadow.addEventListener('click', (event) => {
                                 if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Remove') {
                                     const row = event.target.closest('tr');
                                     const taskId = row.getAttribute('data-id');  // Anta ID-en er i første kolonne

                                     const confirmation = window.confirm(`Are you sure you want to delete task ${taskId}?`);
                                     if (confirmation && this.deleteCallback) {
                                         this.deleteCallback(taskId);
                                     }
                                 }
                             });
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {

        this.statuses = allstatuses;
    }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    changestatusCallback(callback) {

      this.changeCallback = callback;
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    deletetaskCallback(callback) {

        this.deleteCallback = callback;
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {

            if (!this.taskListElement) {
                console.error("Table body (tbody) not found in task list element");
                return;
            }

            const clone = taskrow.content.cloneNode(true);
            let tr = clone.querySelector("tr");
            tr.setAttribute("data-id", task.id);

            let td = clone.querySelectorAll("td");

            td[0].textContent = task.title;
            td[1].textContent = task.status;

            let select = clone.querySelector("select");

            // Add status options to the select element
            for (let status of this.statuses) {
                let option = document.createElement("option");
                option.textContent = status;
                option.value = status;
                if (status === task.status) option.selected = true;
                select.appendChild(option);
            }

            // Prepend to add the new task at the top
            this.taskListElement.insertBefore(clone, this.taskListElement.firstChild);
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {

        let tr = this.shadow.getElementById(task.id);
              let td = tr ? tr.cells[1] : null;
              
              if (td) {
                  td.textContent = task.status;
            }  
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {

        let tr = this.shadow.querySelector("data-id", id );
        if (tr && confirm("Do you want to remove task?")) {
                    tr.remove();
        }
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
     
        return this.taskListElement.tBodies[0].rows.length;
        
    }



}
customElements.define('task-list', TaskList);
