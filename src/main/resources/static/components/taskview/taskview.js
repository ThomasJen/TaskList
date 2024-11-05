import '../tasklist/tasklist.js'
import '../taskbox/taskbox.js'

const template = document.createElement("template");
template.innerHTML = `
 
    <div class="task-view">
        <link rel="stylesheet" type="text/css"href="${import.meta.url.match(/.*\//)[0]}/taskview.css"/>

        <h1>Tasks</h1>
 
        <div id="message"> <p>Waiting for server data.</p> </div>
 
        <div id="newtask"> <button type="button" disabled>New task</button> </div>
 
        <!-- The task list -->
        <task-list> </task-list>

        <!-- The Modal -->
        <task-box></task-box>
     </div>
 `;

class TaskView extends HTMLElement {
    constructor() {
        super();

        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.appendChild(template.content.cloneNode(true));
        
        this.taskList = this.shadow.querySelector('task-list');
        this.taskBox = this.shadow.querySelector('task-box');
        this.messageElement = this.shadow.querySelector('#message');
        this.newTaskButton = this.shadow.querySelector('button');
        
        this.serviceUrl = this.getAttribute('data-serviceurl');
        
        this.initialize()
        
        }

        async initialize(){
                this.messageElement.textContent = "Loading tasks...";
                
                const statuses = await this.fetchAllStatuses();
                if(statuses === null){
                    this.taskBox.setStatusesList(statuses);
                    this.taskList.setStatuseslist(statuses);
                    console.log("Fetched statuses:", statuses);

                    console.log(this.newTaskButton);
                }

                const tasks = await this.fetchAllTasks();
                if(tasks){
                    tasks.forEach(task => this.taskList.showTask(task));
                    this.messageElement.textContent = 'Found ${tasks.length} tasks';
                    } else {
                    this.messageElement.textContent = 'No tasks were found';      
                 }
                    this.newTaskButton.disabled = false; 

                    
                this.taskBox.newtaskCallback(async (newTask) => {
                    const addedTask = await this.createTask(newTask.title, newTask.status);
                    if(addedTask){
                        this.taskList.showTask(addedTask);
                        this.updateMessage();
                    }
                });

                this.taskList.changestatusCallback(async (id, newStatus) => {
                    const updatedTask = await this.updateStatus(id, newStatus);
                    if(updatedTask){
                        this.taskList.updateTask(updatedTask);
                    }
                });

                this.taskList.deletetaskCallback(async id => {
            
                    const deletedTask = await this.deleteTask(id);
                     if(deletedTask){
                            this.taskList.removeTask(id);
                            console.log(`Oppgaven med ID ${id} ble slettet`);
                            this.updateMessage(); 
                        } else {
                            console.error(`Oppgaven med ID ${id} ble ikke slettet fra serveren.`);
                        }
                    });
                    
            
                this.newTaskButton.addEventListener('click', () => {
                    console.log("New task button is clicked:");
                    this.taskBox.show();
                });
                
            }

            async fetchAllStatuses(){
            
                try{
                    const response = await fetch(`${this.serviceUrl}/allstatuses`); 
                    const data = await response.json();
                    if(data.responseStatus){
                        return data.allstatuses;
                    }
                    
                    }catch(error){
                        console.error("Feil ved henting av statuser", error);
                    
                }
                    
            }

            async fetchAllTasks(){
                
                try{
                    const response = await fetch(`${this.serviceUrl}/tasklist`);
                    const data = await response.json(); 
                    if(data.responseStatus){
                        return data.tasks;
                    }       
                
                }catch (error) {
                    console.error('Error fetching tasks:', error);
                }
            
            }
 
            async createTask(title, status){
                try{
                    const response = await fetch(`${this.serviceUrl}/task`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({title, status})
                    });
                    
                    const data = await response.json();
                    if(data.responseStatus){
                        return data.task;
                    }
                }catch(error){
                    console.error('Feil ved oppretting av oppgave:', error);
                }
            }
            
            async updateStatus(id, newStatus){
                try{
                    const response = await fetch(`${this.serviceUrl}/task/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });
                    const data = await response.json(); 
                    if(data.responseStatus){
                        return data;
                    }
                }catch(error){
                    console.error('Feil ved oppdatering av status', error);
                }
            }
             
            async deleteTask(id){
                try{
                    const response = await fetch(`${this.serviceUrl}/task/${id}`,{
                        method: 'DELETE'
                    });
                    
                    const data = await response.json(); 
                    if(data.responseStatus){
                        
                        return data; 
                    }
                    
                }catch(error){
                    console.error('Feil ved sletting av oppgave', error);
                }
            }
            
            updateMessage(){
                const numTasks = this.taskList.getNumtasks();
                if (numTasks === 0) {
                       this.messageElement.textContent = "No tasks were found";
                   } else {
                       this.messageElement.textContent = `Found ${numTasks} tasks`;
                   }
            }   
}
customElements.define('task-view', TaskView);