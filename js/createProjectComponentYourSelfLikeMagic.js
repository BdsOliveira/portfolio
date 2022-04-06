export function createProjectComponentYourSelfLikeMagic() {
    return `
    <link rel="stylesheet" href="../css/project-component-style.css" type="text/css"></link>
    <div class="card column space-inside">
        <div class="card-header row space-inside">
            <div>
                <span class="fa-solid fa-diagram-project fa-xl"></span>
            </div>
            <div>
                <span class="tooltip">
                    <span class="tooltip-message">
                        Check out this project on my GitHub
                    </span>
                    <a class="gitHubLink" target="_blank">
                        <i class="space-inside fa-brands fa-github fa-2xl"></i>
                    </a>
                </span>

                <span class="tooltip">
                    <span class="tooltip-message">
                        Check out this project Live
                    </span>
                    <a class="liveLink" target="_blank">
                        <i class="space-inside fa-solid fa-arrow-up-right-from-square fa-2xl"></i>
                    </a>
                </span>
                
            </div>
        </div>
        <div class="card-content column space-inside">
            <div class="card-title space-inside"></div>
            <div class="card-description space-inside"></div>
        </div>
        <div class="card-footer space-inside">
            <span class="iten-footer iten-footer1"></span>
            <span class="iten-footer iten-footer2"></span>
            <span class="iten-footer iten-footer3"></span>
            <span class="iten-footer iten-footer4"></span>
        </div>
    </div>
    `;
}