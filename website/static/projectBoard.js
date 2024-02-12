const mainBoard = document.querySelector(".home"),
    mainBoardProjectName = document.querySelector("#main-page-project-name"),
    addressTextBox = document.querySelector(".address"),
    customerNameTextBox = document.querySelector(".customer-name");

    mainBoardProjectName.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent the default behavior (line break)
            mainBoardProjectName.blur();
        }
    });
    addressTextBox.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent the default behavior (line break)
            addressTextBox.blur();
        }
    });
    customerNameTextBox.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent the default behavior (line break)
            customerNameTextBox.blur();
        }
    }); 


    mainBoardProjectName.addEventListener("blur", () => {
        const selectedProject = getSelectedMenuLink();
        if(mainBoardProjectName.textContent !== "") {
            selectedProject.querySelector(".nav-text").textContent = mainBoardProjectName.textContent;

            // ============ here send changes to the server ============
        }
        else {
            mainBoardProjectName.textContent = selectedProject.querySelector(".nav-text").textContent;
        }
    });