const template = document.createElement("template");
template.innerHTML = `
        <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/taskbox.css"/>
        
        <dialog>
              <!-- Modal content -->
              <span class="close-btn">&times;</span>
              <div>
               <div> Title: </div>
                <div>
                <input type="text" size="25" maxlength="80" placeholder="Task-title" class="task-title" autofocus />
                </div>
              </div>
             <div>
              <div>Status:</div>
                <div>
                    <select class="task-status">
                        <option value="WAITING">WAITING</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DONE">DONE</option>
                    </select>
                </div>
             </div>
               <p><button type="submit" class="add-task-btn">Add task</button></p>
        </dialog>
        `;
class Taskbox extends HTMLElement {
    #shadow;

    #newcallback;
    constructor() {
        super();

        this.#shadow = this.attachShadow({ mode: 'closed' });
       
        
        this.#shadow.appendChild(template.content.cloneNode(true));
        //console.log(this.#shadow.innerHTML);

        this.dialog = this.#shadow.querySelector('dialog');
        this.closeModalBtn = this.#shadow.querySelector('.close-btn');
        this.addTaskBtn = this.#shadow.querySelector('.add-task-btn');
        this.taskTitleInput = this.#shadow.querySelector('.task-title');
        this.taskStatusSelect = this.#shadow.querySelector('.task-status');
        this.statusesList = ["WAITING", "ACTIVE", "DONE"];

        this.closeModalBtn.addEventListener('click', () => this.close());
       
      //  this.taskCallback = null;
    }


    show() {

        this.dialog.showModal();

    }
    close() {

        this.dialog.close();

    }

    setStatusesList(statuslist) {

        this.taskStatusSelect.innerHTML= '';
        
        
        for (const status of statuslist) {

            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            this.taskStatusSelect.appendChild(option);

        }


    }
    

    newtaskCallback(callback) {
        
       this.#newcallback = callback;
       //this.taskCallback = callback;
       if (this.addTaskBtn) {
           this.addTaskBtn.addEventListener('click', () => {
            const taskTitle = this.taskTitleInput.value;
            const taskStatus = this.taskStatusSelect.value;

               const newTask = { title: taskTitle, status: taskStatus};
               if (this.#newcallback) {
                   this.#newcallback(newTask); // Kall den registrerte callbacken
               } else {
                   console.warn('No new task callback is registered.');
               }

               this.close(); // Lukk taskbox
           });

    }
    }
    
   

}

customElements.define('task-box', Taskbox);