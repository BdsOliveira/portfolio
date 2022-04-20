import { Project } from './Project.js';
import { createProjectComponentYourSelfLikeMagic } from './createProjectComponentYourSelfLikeMagic.js';

class ProjectCard extends HTMLElement {
    constructor() {
        super();
        const projects = this.getProjects()
            .then((projects) => {
                for (let i = 0; i < projects.length; i++) {
                    const project = new Project(projects[i]);
                    if (project.isVisible) {
                        this.innerHTML += createProjectComponentYourSelfLikeMagic(project);
                        //const divProject = document.createElement("div");
                        //divProject.appendChild(createProjectComponentYourSelfLikeMagic(project))
                    }
                    console.log(project, 'Sucessfully created', i);
                }
            })
    }

    // Get my all projects from my backend API
    async getProjects() {
    let projects = [];
    projects = await fetch('http://localhost:5000/projects');

    const response = await projects.json();
    return response;
}
}

window.customElements.define('project-card', ProjectCard);