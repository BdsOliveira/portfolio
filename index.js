import {Project} from "./js/projectCard.js";

export class Project {
    constructor(project) {
        this.id = project[0];
        this.title = project[1];
        this.description = project[2];
        this.gitHubLink = project[3];
        this.liveView = project[4];
        this.technologies = project[5];
        this.isVisible = project[6];
    }
}

function main(){

    let item_project = [
        1, 
        "Portfolio", 
        "Project of creation of my entire portfolio website",
        "https://github.com/BdsOliveira/portfolio",
        "https://portfolio-bdsoliveira.vercel.app/",
        "HTML, CSS, Javascript",
        true
    ];

    let project = new Project(item_project);
    console.log(project);
}
    
(main())