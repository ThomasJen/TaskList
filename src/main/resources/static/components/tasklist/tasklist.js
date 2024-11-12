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
    #taskListElement;
    #tbody;
    #shadow;
    #changecallback;
    #deletecallback;
    constructor() {
        super();

        this.#shadow = this.attachShadow({ mode: 'closed' });
        this.#shadow.appendChild(template.content.cloneNode(true));

        this.#taskListElement = this.#shadow.querySelector('#tasklist');
        this.#taskListElement.appendChild(tasktable.content.cloneNode(true));

        this.#tbody = this.#shadow.querySelector('tbody');
        this.#tbody.appendChild(taskrow);


        this.#shadow.addEventListener('change', (event) => {
            if (event.target.tagName === 'SELECT') {
                const selectElement = event.target;
                const row = selectElement.closest('tr');
                const taskId = row.getAttribute('data-id')  // Anta ID-en er i første kolonne
                const newStatus = selectElement.value;

                // Bekreft og kjør statusendrings-callback hvis tilgjengelig
                const confirmation = window.confirm(`Set '${taskId}' to ${newStatus}?`);
                if (confirmation && this.#changecallback) {
                    this.#changecallback(taskId, newStatus);
                }
            }
        });


        this.#shadow.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Remove') {
                const row = event.target.closest('tr');
                const taskId = row.getAttribute('data-id')  // Anta ID-en er i første kolonne

                // Bekreft og kjør slettings-callback hvis tilgjengelig
                const confirmation = window.confirm(`Are you sure you want to delete task ${taskId}?`);
                if (confirmation && this.#deletecallback) {
                    this.#deletecallback(taskId);
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
        const selectElements = this.#shadow.querySelectorAll('select');

        //Oppdaterer hvert <select> element med de nye statusene
        selectElements.forEach(select => {

            //Fjerner eksisterende alternativer
            select.innerText = '';

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

        tr.cells[0].textContent = task.title;
        tr.cells[1].textContent = task.status;

        if (this.#tbody && this.#tbody.firstChild) {
            this.#tbody.insertBefore(tr, this.#tbody.firstChild); // Legger til oppgaven øverst
        }


        const select = tr.querySelector('select');
        if (this.statuses && this.statuses.length > 0) {
            for (const status of this.statuses) {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (status === task.status) {
                    option.selected = true; // Sett nåværende status som valgt
                }
                select.appendChild(option);
            }
        } else {
            console.warn('No statuses available to populate the select element.');
        }
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {

        const taskId = Number(task.id);
        const newStatus = task.status;

        // Finn raden som tilsvarer denne oppgaven i tabellen
        const taskTableBody = this.#shadow.querySelector('tbody');
        const taskRow = taskTableBody.querySelector(`tr[data-id="${taskId}"]`);

        // Oppdaterer tekstinnholdet for status
        const statusCell = taskRow.cells[1];
        statusCell.textContent = newStatus;


        // Finn <select> elementet i raden
        const selectElement = taskRow.querySelector('select');
        //console.log(taskRow.innerHTML)

        // Oppdater <select> elementet til den nye statusen
        selectElement.value = newStatus;

    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(taskId) {

        const rows = this.#tbody.querySelector(`tr[data-id="${taskId}"]`);
        if(rows !== null) {
            rows.remove();
            console.log(`Task with ID ${taskId} removed successfully`);
        }    
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        //    const numTasks = this.#shadow.querySelectorAll('taskrow[data-id]').length;        
        const numTasks = this.#tbody ? this.#tbody.rows.length : 0;
        console.log('Number of tasks:', numTasks); // Debug-melding
        return numTasks;

    }

}
customElements.define('task-list', TaskList);