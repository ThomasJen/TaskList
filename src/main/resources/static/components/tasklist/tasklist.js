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

    #changecallback;
    #deletecallback;
    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: 'closed' });
        this.shadow.appendChild(template.content.cloneNode(true));

        this.taskListElement = this.shadow.querySelector('#tasklist');
        this.taskListElement.appendChild(tasktable.content.cloneNode(true));

        this.tbody = this.shadow.querySelector('tbody');
        this.tbody.appendChild(taskrow);

        this.tasks = [];
        this.statuses = [];


        this.shadow.addEventListener('change', (event) => {
            if (event.target.tagName === 'SELECT') {
                const selectElement = event.target;
                const row = selectElement.closest('tr');
                const taskId = row.getAttribute('data-id')  // Anta ID-en er i første kolonne
                const newStatus = selectElement.value;

                // Bekreft og kjør statusendrings-callback hvis tilgjengelig
                const confirmation = window.confirm(`Set '${taskId}' to ${newStatus}?`);
                if (confirmation && this.changeCallback) {
                    this.changeCallback(taskId, newStatus);
                }
            }
        });


        this.shadow.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Remove') {
                const row = event.target.closest('tr');
                const taskId = row.getAttribute('data-id')  // Anta ID-en er i første kolonne

                // Bekreft og kjør slettings-callback hvis tilgjengelig
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

        console.log("Statuses list:", allstatuses);

        //Lagre statusene for senere bruk
        this.statuses = allstatuses;

        //Finner alle <select> elementer i tabellen
        const selectElements = this.shadow.querySelectorAll('select');

        //Oppdaterer hvert <select> element med de nye statusene
        selectElements.forEach(select => {

            //Fjerner eksisterende alternativer
            select.innerHTML = '';

            //Legger til standard <Modify>-valg
            const modifyOption = document.createElement('option');
            modifyOption.value = 0;
            modifyOption.textContent = "<Modify>";
            select.appendChild(modifyOption);

            //Legger til hver status som et nytt <option>-element
            allstatuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                select.appendChild(option);
            });

        });
    }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    changestatusCallback(callback) {

        this.#changecallback = callback;
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    deletetaskCallback(callback) {

        this.#deletecallback = callback;
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {

        if (!taskrow || !taskrow.content) {
            console.error("Table body (tbody) not found in task list element");
            return;
        }

        const clone = taskrow.content.cloneNode(true);
        const tr = clone.querySelector('tr');

        tr.setAttribute('data-id', task.id);

        tr.querySelectorAll('td')[0].textContent = task.title;
        tr.querySelectorAll('td')[1].textContent = task.status;


        if (this.tbody) {
            this.tbody.appendChild(tr);
        } else {
            console.error("tbody element is not defined");
        }

        const removeButton = tr.querySelector('button');
        removeButton.addEventListener('click', () => {
            this.removeTask(task.id);
        });


        // Add status options to the select element
        /*     const select = tr.querySelector('select');
                    for (const status of this.statusesList) {
                        const option = document.createElement('option');
                        option.textContent = status;
                        option.value = status;
                        if (status === task.status) {
                            option.selected = true; // Sett den nåværende statusen som valgt
                        }
                        select.appendChild(option); // Legg til statusalternativ i `SELECT`
                    } */

        //  this.tbody.appendChild(tr);

        // Prepend to add the new task at the top
        //      this.taskListElement.insertBefore(clone, this.taskListElement.firstChild); 
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {

        const taskId = Number(task.id);
        const newStatus = task.status;

        //Finn indeks til oppgaven i tabellen
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);

        //Oppdater status dersom oppgaven ble funnet
        if (taskIndex !== -1) {

            //oppdater status i tasks-tabell
            this.tasks[taskIndex].status = newStatus;

            // Finn raden som tilsvarer denne oppgaven i tabellen
            const taskTableBody = this.shadow.querySelector('tbody');
            const taskRow = taskTableBody.children[taskIndex];


            // Oppdaterer tekstinnholdet for status
            const statusCell = taskRow.querySelector('td:nth-child(2)');
            statusCell.textContent = newStatus;

            // Finn <select> elementet i raden
            const selectElement = taskRow.querySelector('select');

            // Oppdater <select> elementet til den nye statusen
            selectElement.value = newStatus;


        } else {
            console.error(`Oppgave med ID ${taskId} ble ikke funnet.`);
        }
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {

        const tr = this.shadow.querySelector(`[data-id="${id}"]`);
        if (tr) {
            tr.remove();
            console.log('Task removed successfully');
        } else {
            console.warn(`Task with ID ${id} could not be found`);
        }
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        //    const numTasks = this.shadow.querySelectorAll('taskrow[data-id]').length;        
        const numTasks = this.tbody ? this.tbody.rows.length : 0;
        console.log('Number of tasks:', numTasks); // Debug-melding
        return numTasks;

    }

}
customElements.define('task-list', TaskList);