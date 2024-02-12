$(document).ready(function () {
  const body = document.querySelector("body"),
    sidebar = document.querySelector("nav"),
    toggle = document.querySelector(".toggle"),
    searchBtn = document.querySelector(".search-box"),
    modeSwitch = document.querySelector(".toggle-switch"),
    modeText = document.querySelector(".mode-text"),
    addProjectBtn = document.querySelector(".add-project"),
    menuLinks = document.querySelector(".menu-links"),
    mainBoard = document.querySelector(".home"),
    mainBoardProjectName = document.querySelector("#main-page-project-name"),
    addressTextBox = document.querySelector(".address"),
    customerNameTextBox = document.querySelector(".customer-name"),
    customerEmailTextBox = document.querySelector("#customer-email"),
    customerPhoneNumberTextBox = document.querySelector(
      "#customer-phone-number"
    ),
    projectNameTexts = document.querySelectorAll(".nav-text"),
    confirmModal = document.getElementById("confirmModal"),
    confirmBtn = document.getElementById("confirmBtn"),
    cancelBtn = document.getElementById("cancelBtn"),
    descriptionTextBox = document.getElementById("descriptionTextBox"),
    quantityTextBox = document.getElementById("quantityTextBox"),
    unitPriceTextBox = document.getElementById("unitPriceTextBox"),
    tableBody = document.getElementById("table-body"),
    addItemBtn = document.getElementById("add-item-btn"),
    submitItemBtn = document.getElementById("submitItemBtn");

  let currentProjectId = 1;
  let selectedItem = 0;
  let selectedItemRow = 0;
  let history = [];
  let projectTimeHistory = {};
  let projectData = null;


  $(".project").click(function (event) {
    event.preventDefault();

    var projectId = $(this).parent().data("project-id");
    currentProjectId = projectId;
    $.get("/projects/" + projectId, function (data) {
      if (data.error) {
        console.log("Invoice not found");
      } else {
        $("#main-page-project-name").text(data.title);
        projectData = data;
        //==============================================================
        if (data.customers[0] && data.customers[0].address)
          $("#address").text(data.customers[0].address);
        else $("#address").text("Enter the address of the house");
        //==============================================================

        //==============================================================
        if (data.customers[0] && data.customers[0].name)
          $("#customer-name").text(data.customers[0].name);
        else $("#customer-name").text("Customer's contact name");
        //==============================================================

        //==============================================================
        if (data.customers[0] && data.customers[0].phone_number)
          $("#customer-phone-number").text(data.customers[0].phone_number);
        else
          $("#customer-phone-number").text("Customer's contact phone number");
        //==============================================================

        //==============================================================
        if (data.customers[0] && data.customers[0].email)
          $("#customer-email").text(data.customers[0].email);
        else $("#customer-email").text("Customer's contact email");

        while (tableBody.firstChild) {
          tableBody.removeChild(tableBody.firstChild);
        }
        for (let index = 0; index < data.items.length; index++) {
          const newRow = document.createElement("tr");
          newRow.setAttribute("data-invoice-item-id", data.items[index].id);
          newRow.classList.add("row");
          const columnNumber = tableBody.childElementCount + 1;
          newRow.innerHTML = `
                        <td class="cell">${columnNumber}</td>
                        <td contenteditable="true" class="editable-column cell" data-column-type="description" data-value="${data.items[index].description}">${data.items[index].description}</td>
                        <td contenteditable="true" class="editable-column cell" data-column-type="quantity" data-value="${data.items[index].quantity}">${data.items[index].quantity}</td>
                        <td contenteditable="true" class="editable-column cell" data-column-type="unit-price" data-value="${data.items[index].unitPrice}">${data.items[index].unitPrice}</td>
                        <td data-column-type="amount" class="cell">${data.items[index].totalAmount}</td>
                    `;

          tableBody.appendChild(newRow);
        }
        var yearSelect = $("#years-combo-box");
        yearSelect.empty();

        var monthSelect = $("#months-combo-box");
        monthSelect.empty();

        if (data.items.length > 0 && data.items[data.items.length - 1].added_date) {
          const latestAddedItemDate = data.items[data.items.length - 1].added_date;
          const invoiceCreationDate = data.date;

          const latestAddedItemYear = latestAddedItemDate ? new Date(latestAddedItemDate).getUTCFullYear() : null;
          const invoiceCreationYear = invoiceCreationDate ? new Date(invoiceCreationDate).getUTCFullYear() : null;

          for (let i = invoiceCreationYear; i <= latestAddedItemYear; i++) {
            yearSelect.append(`<option value="${i}">${i}</option>`);
            projectTimeHistory[i] = Array.from(getMonthsOfTheYear(data, i));            
          }

          const currentDate = new Date();
          const currentYear = (currentDate.getFullYear());
          if (currentYear != latestAddedItemYear) {
            yearSelect.append(`<option value="${currentYear}">${currentYear}</option>`);
            projectTimeHistory[currentYear] = Array.from(getMonthsOfTheYear(data, currentYear));
          }
        }
        else {
          // const invoiceCreationDate = data.date;
          // const invoiceCreationYear = invoiceCreationDate ? new Date(invoiceCreationDate).getUTCFullYear() : null;
          const currentDate = new Date();
          const currentYear = (currentDate.getFullYear());
          yearSelect.append(`<option value="${currentYear}">${currentYear}</option>`);
        }
        $("#years-combo-box option:last").prop("selected", true);
        

        //==============================================================
        $(".home").removeClass("home-hidden");

        $('#years-combo-box').on('change', function () {
          var selectedYear = $(this).val();
          console.log(selectedYear);
          console.log(getMonthsOfTheYear(data, selectedYear));
          var monthsOfSelectedYear = getMonthsOfTheYear(data, selectedYear);
          monthSelect.empty();
          if(monthsOfSelectedYear.size > 0)
            monthsOfSelectedYear.forEach(element => {
              monthSelect.append(`<option value="${element}">${element}</option>`);
            });
          //else {
            const currentDate = new Date();
            const currentMonth = getMonthByNumber(currentDate.getMonth());
            monthSelect.append(`<option value="${currentMonth}">${currentMonth}</option>`);
          //}
          $("#months-combo-box option:last").prop("selected", true);          
          const itemsOfYearAndMonth = getItemsByYearAndMonth(data, $("#years-combo-box option:selected").val(), $("#months-combo-box option:selected").val());
          while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
          }
          for (let index = 0; index < itemsOfYearAndMonth.length; index++) {
            const newRow = document.createElement("tr");
            newRow.setAttribute("data-invoice-item-id", itemsOfYearAndMonth[index].id);
            newRow.classList.add("row");
            const columnNumber = tableBody.childElementCount + 1;
            newRow.innerHTML = `
                          <td class="cell">${columnNumber}</td>
                          <td contenteditable="true" class="editable-column cell" data-column-type="description" data-value="${itemsOfYearAndMonth[index].description}">${itemsOfYearAndMonth[index].description}</td>
                          <td contenteditable="true" class="editable-column cell" data-column-type="quantity" data-value="${itemsOfYearAndMonth[index].quantity}">${itemsOfYearAndMonth[index].quantity}</td>
                          <td contenteditable="true" class="editable-column cell" data-column-type="unit-price" data-value="${itemsOfYearAndMonth[index].unitPrice}">${itemsOfYearAndMonth[index].unitPrice}</td>
                          <td data-column-type="amount" class="cell">${itemsOfYearAndMonth[index].totalAmount}</td>
                      `;
            tableBody.appendChild(newRow);
          }
        });

        $('#months-combo-box').on('change', function () {   
          const itemsOfYearAndMonth = getItemsByYearAndMonth(data, $("#years-combo-box option:selected").val(), $("#months-combo-box option:selected").val());
          while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
          }
          for (let index = 0; index < itemsOfYearAndMonth.length; index++) {
            const newRow = document.createElement("tr");
            newRow.setAttribute("data-invoice-item-id", itemsOfYearAndMonth[index].id);
            newRow.classList.add("row");
            const columnNumber = tableBody.childElementCount + 1;
            newRow.innerHTML = `
                          <td class="cell">${columnNumber}</td>
                          <td contenteditable="true" class="editable-column cell" data-column-type="description" data-value="${itemsOfYearAndMonth[index].description}">${itemsOfYearAndMonth[index].description}</td>
                          <td contenteditable="true" class="editable-column cell" data-column-type="quantity" data-value="${itemsOfYearAndMonth[index].quantity}">${itemsOfYearAndMonth[index].quantity}</td>
                          <td contenteditable="true" class="editable-column cell" data-column-type="unit-price" data-value="${itemsOfYearAndMonth[index].unitPrice}">${itemsOfYearAndMonth[index].unitPrice}</td>
                          <td data-column-type="amount" class="cell">${itemsOfYearAndMonth[index].totalAmount}</td>
                      `;
            tableBody.appendChild(newRow);
          }
        });

        $("#years-combo-box").trigger('change');
      }
    });
  });
  $(document).on("click", ".cell", function () {
    $(".row").removeClass("selected-style");
    $(this).closest(".row").addClass("selected-style");

    var row = $(this).parent();
    selectedItemRow = row;
    selectedItem = row.data("invoice-item-id");
    console.log("clicked cell");
  });

  
  
  function getMonthByNumber(number)
  {
    let month = "";
    switch (number) {
      case 0:
        month = "January";
        break;
      case 1:
        month = "February";
        break;
      case 2:
        month = "March";
        break;
      case 3:
        month = "April";
        break;
      case 4:
        month = "May";
        break;
      case 5:
        month = "June";
        break;
      case 6:
        month = "July";
        break;
      case 7:
        month = "August";
        break;
      case 8:
        month = "September";
        break;
      case 9:
        month = "October";
        break;
      case 10:
        month = "November";
        break;
      case 11:
        month = "December";
        break;
    }
    return month;
  }

  function getNumberByMonth(month)
  {
    let number = "";

    switch (month) {
      case "January":
        number = "01";
        break;
      case "February":
        number = "02";
        break;
      case "March":
        number = "03";
        break;
      case "April":
        number = "04";
        break;
      case "May":
        number = "05";
        break;
      case "June":
        number = "06";
        break;
      case "July":
        number = "07";
        break;
      case "August":
        number = "08";
        break;
      case "September":
        number = "09";
        break;
      case "October":
        number = "10";
        break;
      case "November":
        number = "11";
        break;
      case "December":
        number = "12";
        break;
    }
    return number;
  }

  function getMonthsOfTheYear(data, year) {
    const uniqueMonths = new Set();

    for (const item of data.items) {
        const itemDateWithoutMilliseconds = String(item.added_date).split(".")[0];
        const itemDate = new Date(itemDateWithoutMilliseconds);

        if (itemDate.getFullYear() == year) {
            const month = itemDate.getMonth();
            uniqueMonths.add(month);
        }
    }

    const sortedUniqueMonths = Array.from(uniqueMonths).sort((a, b) => a - b);
    const months = new Set(sortedUniqueMonths.map(getMonthByNumber));
    
    return months;
  }

  function getItemsByYearAndMonth(data, year, month)
  {
    const itemsByYearAndMonth = new Array();
    var yearAndMonth = String(year) + "-" + getNumberByMonth(month);    
    for (let i = 0; i < data.items.length; i++) {
      
      const dateWithoutMilliseconds = String(data.items[i].added_date).split(".")[0];
      const itemDate = new Date(dateWithoutMilliseconds);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth();
      const itemYearAndMonth = String(itemYear) + "-" + getNumberByMonth(getMonthByNumber(itemMonth));
      
      if (itemYearAndMonth == yearAndMonth) {
        itemsByYearAndMonth.push(data.items[i]);
      }
    }
    return itemsByYearAndMonth;
  }

  function isPastable()
  {
    return navigator.clipboard.readText()
    .then(function (clipboardData) {
      try {
        const objFromClipboard = JSON.parse(clipboardData);
        return objFromClipboard.description && objFromClipboard.quantity && objFromClipboard.unitPrice;
      } catch (error) {
        return false;
      }
    })
    .catch(function (error) {
      return false; 
    });
  }

  tableBody.addEventListener("contextmenu", function (event) {
    event.preventDefault();

    var contextMenu = document.getElementById("context-menu");

    var contextMenuX = event.clientX;
    var contextMenuY = event.clientY;

    contextMenuX += window.scrollX;
    contextMenuY += window.scrollY;

    contextMenuX -= tableBody.scrollLeft;
    contextMenuY -= tableBody.scrollTop;

    contextMenu.style.left = event.pageX + "px";
    contextMenu.style.top = event.pageY + "px";
    contextMenu.style.display = "block";

    isPastable().then(function (result) {
      if (result) {
        $("#paste-item-btn").removeClass("item-disabled");
      } else {
        $("#paste-item-btn").addClass("item-disabled");
      }
    });

    var row = event.target.closest(".row");
    if (row) {
      $(".row").removeClass("selected-style");
      row.classList.add("selected-style");
      selectedItemRow = $(row);
      selectedItem = selectedItemRow.data("invoice-item-id");
      
    }

    contextMenu.addEventListener("click", function (e) {
      if (e.target.id === "remove-item-btn") {
        fetch(`/delete_invoice_item/${currentProjectId}/${selectedItem}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              selectedItemRow.remove();
            } else {
              console.error(
                "Error deleting invoice item:",
                response.statusText
              );
            }
          })
          .catch((error) => {
            console.error("Network error:", error);
          });
      }

      

      contextMenu.style.display = "none";
    });

    document.addEventListener("click", function () {
      contextMenu.style.display = "none";
    });
  });

  $(document).on("click", "#copy-item-btn", function (e) {
    if (selectedItemRow) {
      const cells = selectedItemRow.find('td');
  
      const descriptionColumnValue = cells[1].textContent;
      const quantityColumnValue = cells[2].textContent;
      const unitPriceColumnValue = cells[3].textContent;
  
      const copyObject = JSON.stringify({
        description: descriptionColumnValue,
        quantity: quantityColumnValue,
        unitPrice: unitPriceColumnValue
      });
      var textarea = document.createElement("textarea");
      textarea.value = copyObject; // Your JSON string

      // Append the textarea to the document
      document.body.appendChild(textarea);

      // Select the content of the textarea
      textarea.select();

      // Execute the copy command
      document.execCommand('copy');

      // Remove the textarea from the document
      document.body.removeChild(textarea);      
    }
  });
  $(document).on("click", "#paste-item-btn", function (e) {
      navigator.clipboard.readText().then(function (clipboardData) {
        const objFromClipBoard = JSON.parse(clipboardData);
        const year = $("#years-combo-box option:selected").val();
        const month = getNumberByMonth($("#months-combo-box option:selected").val());
        const itemDate = `${year}-${month}-28 12:19:55.784570`;
        const newItemData = {
          description: objFromClipBoard.description,
          quantity: objFromClipBoard.quantity,
          unit_price: objFromClipBoard.unitPrice,
          date: itemDate
        };
        fetch(`/create_new_invoice_item/${currentProjectId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItemData),
        })
          .then((response) => {
            if (response.ok) {
              console.log("Update successful");
              return response.json();
            } else {
              console.error("Update error");
            }
          })
          .then((data) => {
            console.log(data);
            if (data && data.invoice_item_id) {
              const newRow = document.createElement("tr");
              newRow.setAttribute("data-invoice-item-id", data.invoice_item_id);
              const columnNumber = tableBody.childElementCount + 1;
            
              newRow.innerHTML = `<td class="cell">${columnNumber}</td>
            <td contenteditable="true" class="editable-column cell" data-column-type="description" data-value="${objFromClipBoard.description}">${objFromClipBoard.description}</td>
            <td contenteditable="true" class="editable-column cell" data-column-type="quantity" data-value="${objFromClipBoard.quantity}">${objFromClipBoard.quantity}</td>
            <td contenteditable="true" class="editable-column cell" data-column-type="unit-price" data-value="${objFromClipBoard.unitPrice}">${objFromClipBoard.unitPrice}</td>
            <td data-column-type="amount" class="cell">${(parseFloat(objFromClipBoard.quantity) * parseFloat(objFromClipBoard.unitPrice)).toFixed(2)}</td>`;

              tableBody.appendChild(newRow);
              tableBody.scrollTop = tableBody.scrollHeight;
            } else {
              console.error("Invoice item ID is missing in the response");
              console.error(data);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });

      }).catch(function (error) {
        //console.error("Error reading clipboard:", error);
      });
    
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      var contextMenu = document.getElementById("context-menu");
      contextMenu.style.display = "none";
    }
  });

  document.addEventListener("click", function (event) {
    var contextMenu = document.getElementById("context-menu");
    contextMenu.style.display = "none";
  });
  document.addEventListener("click", function (event) {
    if (!event.target.closest("tbody")) {
      if (selectedItemRow) {
        selectedItemRow.removeClass("selected-style");
      }
    }
  });

  $(addItemBtn).click(function (event) {
    window.scrollBy({
      top: tableBody.offsetHeight, // Scroll the the end of the tabele's height
      behavior: "smooth",
    });
    var rowpos = $("#table-body tr:last").position();
    if(rowpos.top)
      $("#table-container").scrollTop(rowpos.top);
    $("#descriptionTextBox").focus();
  });

  $(document).on("keydown", ".editable-column", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      $(this).blur();
    }
  });
  $(document).on("blur", ".editable-column", function () {
    var row = $(this).parent();
    const itemId = row.data("invoice-item-id");
    const columnType = $(this).data("column-type");
    if (columnType == "unit-price" || columnType == "quantity") {
      var amountTd = row.find('td[data-column-type="amount"]');
      var unitPriceTd = row.find('td[data-column-type="unit-price"]');
      var quantityTd = row.find('td[data-column-type="quantity"]');

      var unitPrice = parseFloat(unitPriceTd.text());
      var quantity = parseFloat(quantityTd.text());

      if (!isNaN(unitPrice) && !isNaN(quantity)) {
        console.log($(this).data("value"));
        console.log($(this).text());
        if ($(this).data("value") != $(this).text()) {
          
          const updateData = {
            item: {
              id: itemId,
              dataType: columnType,
              data: $(this).text(),
            },
          };
          sendUpdateToServer(updateData, currentProjectId);
        }
        var amount = unitPrice * quantity;
        unitPriceTd.data("value", unitPrice);
        quantityTd.data("value", quantity);
        amountTd.text(amount.toFixed(2));
        
      } else if (isNaN(unitPrice)) {
        unitPriceTd.text(unitPriceTd.data("value"));
      } else if (isNaN(quantity)) {
        quantityTd.text(quantityTd.data("value"));
      }
    }
    
  });

  descriptionTextBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      descriptionTextBox.blur();
    }
  });
  quantityTextBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      quantityTextBox.blur();
    }
  });
  unitPriceTextBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      unitPriceTextBox.blur();
    }
  });

  function showModal() {
    var month = $("#months-combo-box").val();
    var year = $("#years-combo-box").val();
    $(".header-question").text(`Add item to '${month}' ${year} section?`);
    $(".confirm-btn").text(`Yes, add to '${month} ${year}'`);
    var modal = $("#confirmation-modal");
    var modalWidth = modal.width();
    var modalHeight = modal.height();

    var submitItemBtnX = $(submitItemBtn).offset().left;
    var submitItemBtnY = $(submitItemBtn).offset().top;

    var left = submitItemBtnX - modalWidth/3;
    var top = submitItemBtnY - modalHeight/2;

    modal.css({
        left: left + "px",
        top: top + "px"
    });
    document.getElementById("overlay").style.display = "block";
    modal.removeClass("hidden");
    modal.addClass("visible");
  }
  $(".confirm-btn").click(function () {
    document.getElementById("overlay").style.display = "none";
    $("#confirmation-modal").addClass("hidden");
    // 2023-10-28 12:19:55.784570
    const year = $("#years-combo-box option:selected").val();
    const month = getNumberByMonth($("#months-combo-box option:selected").val());
    const itemDate = `${year}-${month}-28 12:19:55.784570`;

    const newItemData = {
      description: descriptionTextBox.value,
      quantity: quantityTextBox.value,
      unit_price: unitPriceTextBox.value,
      date: itemDate,
    };
    fetch(`/create_new_invoice_item/${currentProjectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItemData),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Update successful");
          return response.json();
        } else {
          console.error("Update error");
        }
      })
      .then((data) => {
        if (data && data.invoice_item_id) {
          const newRow = document.createElement("tr");
          newRow.setAttribute("data-invoice-item-id", data.invoice_item_id);
          const columnNumber = tableBody.childElementCount + 1; // Calculate the new column number
          newRow.innerHTML = `
                    <td class="cell">${columnNumber}</td>
                    <td contenteditable="true" class="editable-column cell" data-column-type="description" data-value="${descriptionTextBox.value}">${descriptionTextBox.value}</td>
                    <td contenteditable="true" class="editable-column cell" data-column-type="quantity" data-value="${quantityTextBox.value}">${quantityTextBox.value}</td>
                    <td contenteditable="true" class="editable-column cell" data-column-type="unit-price" data-value="${unitPriceTextBox.value}">${unitPriceTextBox.value}</td>
                    <td data-column-type="amount" class="cell">${(
              parseFloat(quantityTextBox.value) *
              parseFloat(unitPriceTextBox.value)
            ).toFixed(2)}</td>`;

          tableBody.appendChild(newRow);

          descriptionTextBox.value = "";
          quantityTextBox.value = "";
          unitPriceTextBox.value = "";

          tableBody.scrollTop = tableBody.scrollHeight;
        } else {
          console.error("Invoice item ID is missing in the response");
          console.error(data);
        }
      })
      .catch((error) => {
        // Handle network or other errors
        console.error("Error:", error);
      });

  });
  $(".cancel-btn").click(function() {
    document.getElementById("overlay").style.display = "none";
    $("#confirmation-modal").addClass("hidden");

    $("#months-combo-box option:last").prop("selected", true); 
    $("#months-combo-box").trigger('change');
    $(submitItemBtn).click();
  });

  $(submitItemBtn).click(function (event) {
    if (
      descriptionTextBox.value &&
      quantityTextBox.value &&
      unitPriceTextBox.value
    ) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = getMonthByNumber(currentDate.getMonth());

      const selectedYear = $("#years-combo-box option:selected").val();
      const selectedMonth = $("#months-combo-box option:selected").val()

      if (currentYear != selectedYear || currentMonth != selectedMonth)
        showModal();
      else {
        const newItemData = {
          description: descriptionTextBox.value,
          quantity: quantityTextBox.value,
          unit_price: unitPriceTextBox.value,
        };
        fetch(`/create_new_invoice_item/${currentProjectId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItemData),
        })
          .then((response) => {
            if (response.ok) {
              console.log("Update successful");
              return response.json();
            } else {
              console.error("Update error");
            }
          })
          .then((data) => {
            if (data && data.invoice_item_id) {
              const newRow = document.createElement("tr");
              newRow.setAttribute("data-invoice-item-id", data.invoice_item_id);
              const columnNumber = tableBody.childElementCount + 1; // Calculate the new column number
              newRow.innerHTML = `
                        <td class="cell">${columnNumber}</td>
                        <td contenteditable="true" class="editable-column cell" data-column-type="description" data-value="${descriptionTextBox.value}">${descriptionTextBox.value}</td>
                        <td contenteditable="true" class="editable-column cell" data-column-type="quantity" data-value="${quantityTextBox.value}">${quantityTextBox.value}</td>
                        <td contenteditable="true" class="editable-column cell" data-column-type="unit-price" data-value="${unitPriceTextBox.value}">${unitPriceTextBox.value}</td>
                        <td data-column-type="amount" class="cell">${(
                  parseFloat(quantityTextBox.value) *
                  parseFloat(unitPriceTextBox.value)
                ).toFixed(2)}</td>`;

              tableBody.appendChild(newRow);

              descriptionTextBox.value = "";
              quantityTextBox.value = "";
              unitPriceTextBox.value = "";

              tableBody.scrollTop = tableBody.scrollHeight;
            } else {
              console.error("Invoice item ID is missing in the response");
              console.error(data);
            }
          })
          .catch((error) => {
            // Handle network or other errors
            console.error("Error:", error);
          });
      }
    } else {
      if (!descriptionTextBox.value)
        descriptionTextBox.classList.add("error-style");
      if (!quantityTextBox.value) quantityTextBox.classList.add("error-style");
      if (!unitPriceTextBox.value)
        unitPriceTextBox.classList.add("error-style");
    }
  });
  $(descriptionTextBox).focus(function () {
    descriptionTextBox.classList.remove("error-style");
  });
  $(quantityTextBox).focus(function () {
    quantityTextBox.classList.remove("error-style");
  });
  $(unitPriceTextBox).focus(function () {
    unitPriceTextBox.classList.remove("error-style");
  });

  mainBoardProjectName.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      mainBoardProjectName.blur();
    }
  });
  addressTextBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addressTextBox.blur();
    }
  });
  customerNameTextBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      customerNameTextBox.blur();
    }
  });
  customerEmailTextBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      customerEmailTextBox.blur();
    }
  });
  customerPhoneNumberTextBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      customerPhoneNumberTextBox.blur();
    }
  });

  mainBoardProjectName.addEventListener("blur", () => {
    const selectedProject = getSelectedMenuLink();
    if (mainBoardProjectName.textContent !== "") {
      selectedProject.querySelector(".nav-text").textContent =
        mainBoardProjectName.textContent;

      // ============ here send changes to the server ============
      const projectIdToChange =
        selectedProject.parentElement.getAttribute("data-project-id");
      const updateData = {
        title: mainBoardProjectName.textContent,
      };
      sendUpdateToServer(updateData, projectIdToChange);
    } else {
      mainBoardProjectName.textContent =
        selectedProject.querySelector(".nav-text").textContent;
    }
  });
  addressTextBox.addEventListener("blur", () => {
    if (addressTextBox.textContent) {      
      const updateData = {
        customer: {
          address: addressTextBox.textContent,
        },
      };
      sendUpdateToServer(updateData, currentProjectId);
    }
  });
  customerNameTextBox.addEventListener("blur", function (e) {
    if (customerNameTextBox.textContent) {
      const updateData = {
        customer: {
          name: customerNameTextBox.textContent,
        },
      };
      sendUpdateToServer(updateData, currentProjectId);
    }
  });
  customerEmailTextBox.addEventListener("blur", () => {
    if (customerEmailTextBox.textContent) {
      const updateData = {
        customer: {
          email: customerEmailTextBox.textContent,
        },
      };
      sendUpdateToServer(updateData, currentProjectId);
    }
  });
  customerPhoneNumberTextBox.addEventListener("blur", () => {
    if (customerPhoneNumberTextBox.textContent) {
      const updateData = {
        customer: {
          phone_number: customerPhoneNumberTextBox.textContent,
        },
      };
      sendUpdateToServer(updateData, currentProjectId);
    }
  });

  function sendUpdateToServer(data, projectId) {
    //console.log(`/save_changes_to_invoice/${projectId}`);
    // fetch(`/save_changes_to_invoice/${projectId}`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(data),
    // })
    //   .then((response) => {
    //     if (response.ok) {
    //       // Update successful
    //       console.log("Update successful");
    //     } else {
    //       // Handle update error
    //       console.error("Update error");
    //     }
    //   })
    //   .catch((error) => {
    //     // Handle network or other errors
    //     console.error("Error:", error);
    //   });
    $.ajax({
      url: `/save_changes_to_invoice/${projectId}`,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(response) {
        // Check the response for success
        //console.log("Update successful");
      },
      error: function(xhr, status, error) {
        // Handle errors
        console.error("Update error:", error);
      }
    });
  }

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  });
  searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
  });

  addProjectBtn.addEventListener("click", function () {
    if (!document.querySelector(".new-project-input")) {
      const newProjectInput = document.createElement("li");
      newProjectInput.classList.add(
        "nav-link",
        "new-project-input",
        "add-project-input-box"
      );
      newProjectInput.innerHTML = `
                <input type="text" id="project-name" placeholder="Enter project name">
            `;

      menuLinks.appendChild(newProjectInput);

      const projectNameInput = newProjectInput.querySelector("#project-name");
      projectNameInput.focus();

      const status = { isProjectAdded: false, isInputRemoved: false };

      projectNameInput.addEventListener("keyup", function (e) {
        if (e.key === "Enter") {
          createNewProject(
            status,
            "Enter",
            newProjectInput,
            menuLinks,
            projectNameInput
          );
        }
      });
      projectNameInput.addEventListener("blur", () => {
        createNewProject(
          status,
          "blur",
          newProjectInput,
          menuLinks,
          projectNameInput
        );
      });
    }
  });

  modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
      modeText.innerText = "Light mode";
    } else {
      modeText.innerText = "Dark mode";
    }
  });

  menuLinks.addEventListener("click", (event) => {
    const target = event.target;
    if (
      target.classList.contains("project") &&
      !target.classList.contains("add-project")
    ) {
      const projectItems = document.querySelectorAll(".project");
      projectItems.forEach((project) => {
        project.classList.remove("selected");
      });
      target.classList.add("selected");
    }

    if (target.classList.contains("trash-icon")) {
      confirmModal.style.display = "block";

      confirmBtn.addEventListener("click", () => {
        const selectedProject = Array.from(
          document.querySelectorAll(".nav-link")
        ).find((li) => li.querySelector(".project.selected"));
        const projectId = selectedProject.getAttribute("data-project-id");
        fetch(`/delete_invoice/${projectId}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              menuLinks.removeChild(selectedProject);
              //clearMainBoard();
              confirmModal.style.display = "none";
            } else {
              console.error("Error deleting invoice:", response.statusText);
            }
          })
          .catch((error) => {
            console.error("Network error:", error);
          });

        confirmModal.style.display = "none";
      });

      cancelBtn.addEventListener("click", () => {
        confirmModal.style.display = "none";
      });
    }
  });

  // ======================================================================================================
  function createNewProject(
    status,
    event,
    newProjectInput,
    menuLinks,
    projectNameInput
  ) {
    if (!status.isProjectAdded && projectNameInput.value.trim() !== "") {
      displayMainBoard();
      const requestData = {
        title: projectNameInput.value,
      };
      fetch("/create_invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); // Parse the JSON data
          } else {
            throw new Error("Failed to create an invoice");
          }
        })
        .then((data) => {
          if (data && data.invoice_id) {
            const newInvoiceId = data.invoice_id;
            const newProjectLink = document.createElement("a");
            newProjectLink.classList.add("project");
            newProjectLink.href = "#";
            newProjectLink.innerHTML = `
                        <i class='bx bx-home-alt icon'></i>
                        <span class="text nav-text">${projectNameInput.value}</span>
                        <i class='bx bx-trash trash-icon'></i>
                    `;

            const projectItems = document.querySelectorAll(".project");
            projectItems.forEach((project) => {
              project.classList.remove("selected");
            });

            newProjectLink.classList.add("selected");
            const projectNameMainPage = document.querySelector(
              "#main-page-project-name"
            );
            projectNameMainPage.textContent = projectNameInput.value;

            status.isProjectAdded = true;
            const newProjectListItem = document.createElement("li");
            newProjectListItem.classList.add("nav-link");
            newProjectListItem.setAttribute("data-project-id", newInvoiceId);
            newProjectListItem.appendChild(newProjectLink);

            menuLinks.appendChild(newProjectListItem);

            if (!status.isInputRemoved) {
              menuLinks.removeChild(newProjectInput);
              status.isInputRemoved = true;
            }
          } else {
            console.error("Invoice ID is missing in the response");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else if (event == "Enter") {
      newProjectInput.setAttribute("style", "color: red;");
    } else if (event == "blur") {
      if (newProjectInput && !status.isInputRemoved) {
        menuLinks.removeChild(newProjectInput);
        status.isInputRemoved = true;
      }
    }
  }

  function clearMainBoard() {
    if (mainBoard.style.display !== "none") {
      mainBoard.style.display = "none";
    }
  }
  function displayMainBoard() {
    if (mainBoard.style.display === "none") {
      mainBoard.style.display = "block";
    }
  }

  function getSelectedMenuLink() {
    const selectedMenuLink = document.querySelector(".project.selected");
    return selectedMenuLink;
  }

  $("#upload-from-file-btn").click(function () {
    $("#fileInput").click();
  });

  $("#fileInput").on("change", function () {
    const fileInput = document.getElementById("fileInput");

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("pdf_file", file);
    formData.append("file_name", file.name); 

    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "block";
    const content = document.getElementById("content");
    content.style.filter = "blur(3px)";

    fetch(`/read_invoice_file/${currentProjectId}`, {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      loadingSpinner.style.display = "none";
      content.style.filter = "";
      if (data.error) {
        alert("Error extracting data from the PDF file.");
      } else {
        if (data.length == 0) {
          console.log(data);
          $("#error-modal").css('display', 'block');
          document.getElementById("overlay").style.display = "block";
        }
        for (const row of data) {
          console.log(`description: ${row.description}\nquantity: ${row.quantity}\nunit price: ${row.unitPrice}\namount: ${row.amount}`);
          const newRow = document.createElement("tr");
          newRow.setAttribute("data-invoice-item-id", row.id);
          const columnNumber = tableBody.childElementCount + 1; // Calculate the new column number
          newRow.innerHTML = `
                    <td class="cell">${columnNumber}</td>
                    <td contenteditable="true" class="editable-column cell" data-column-type="description" data-value="${row.description}">${row.description}</td>
                    <td contenteditable="true" class="editable-column cell" data-column-type="quantity" data-value="${row.quantity}">${row.quantity}</td>
                    <td contenteditable="true" class="editable-column cell" data-column-type="unit-price" data-value="${row.unitPrice}">${row.unitPrice}</td>
                    <td data-column-type="amount" class="cell">${row.amount}</td>`;

          tableBody.appendChild(newRow);
          $(addItemBtn).click();
        }
        history.push({ action: 'upload', data: data });
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
  });
  function removeItem(currentProjectId, selectedItem) {
    fetch(`/delete_invoice_item/${currentProjectId}/${selectedItem}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          selectedItemRow.remove();
        } else {
          console.error(
            "Error deleting invoice item:",
            response.statusText
          );
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  }
  function undoUpload() {
    if (history.length > 0) {
      const lastAction = history.pop();
      if (lastAction.action === 'upload') {

        console.log(lastAction.data);
        const rows = tableBody.querySelectorAll('tr');
        const startIdx = rows.length - lastAction.data.length;
        if (startIdx > 0) {
          for (let i = rows.length - 1; i >= startIdx; i--) {
            tableBody.removeChild(rows[i]);
          }
        }

        lastAction.data.forEach(item => {
          removeItem(currentProjectId, item.id);
        });
      }
    }
  }
  document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      undoUpload();
    }
  });
  
  const container = document.getElementById('dropdowns');
  container.addEventListener('click', function(event) {
    if (event.target.classList.contains('dropdown')) {
      event.target.classList.toggle('active');
      const content = event.target.nextElementSibling;

      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    }
  });

  $("#export-pdf-btn").click(function (event) {
    event.stopPropagation();
    $(".export-modal").css('display', 'block');
    document.getElementById("overlay").style.display = "block";

    const container = document.getElementById('dropdowns');    
    container.innerHTML = '';
    console.log(projectTimeHistory);
    for (const [year, months] of Object.entries(projectTimeHistory)) {
      if (Object.hasOwnProperty.call(projectTimeHistory, year)) {
        const yearDiv = document.createElement('div');
        yearDiv.classList.add('year-dropdown');
    
        const dropdownDiv = document.createElement('div');
        dropdownDiv.classList.add('dropdown');
        dropdownDiv.innerHTML = `
          <span>${year}</span>
        `;
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content');
    
        projectTimeHistory[year].forEach(month => {
          const checkboxDiv = document.createElement('div');
          checkboxDiv.classList.add('checkbox-month');
          checkboxDiv.innerHTML = `
            <input type="checkbox" id="${month.toLowerCase()}" name="${month.toLowerCase()}" class="checkbox year-checkbox" data-value="${year} ${month.toLowerCase()}"/>
            <label for="${month.toLowerCase()}">${month}</label>
          `;
          
          contentDiv.appendChild(checkboxDiv);
        });
    
        yearDiv.appendChild(dropdownDiv);
        yearDiv.appendChild(contentDiv);
        container.appendChild(yearDiv);
      }
    }

  });

  $(".close-modal-btn").click(function () {
    $("#error-modal").css('display', 'none');
    document.getElementById("overlay").style.display = "none";
    
  })

  $("#select-whole-project").on('change', function () {
    const dropdownCheckboxes = Array.from(document.getElementsByClassName("checkbox"));
    const dropdowns = Array.from(document.getElementsByClassName("dropdown"));
    if ($(this).is(':checked')) {
      dropdownCheckboxes.forEach(checkbox => {
        $(checkbox).prop('checked', true);
      });
      dropdowns.forEach(dropdown => {
        if (!dropdown.classList.contains("active")) {
          dropdown.click();
        }
      });
    } else {
      dropdownCheckboxes.forEach(checkbox => {
        $(checkbox).prop('checked', false);
      });
      dropdowns.forEach(dropdown => {
        if (!dropdown.classList.contains("active")) {
          dropdown.click();
        }
      });
    }
  });

  $("#select-current").on('change', function () {
    const dropdownCheckboxes = Array.from(document.getElementsByClassName("checkbox"));
    const dropdowns = Array.from(document.getElementsByClassName("dropdown"));
    if ($(this).is(':checked')) {
      if (dropdownCheckboxes.length > 0) {
        const lastCheckbox = dropdownCheckboxes[dropdownCheckboxes.length - 1];
        $(lastCheckbox).prop('checked', true);
      }
      
      if (dropdowns.length > 0) {
        const lastDropdown = dropdowns[dropdowns.length - 1];
        if (!lastDropdown.classList.contains("active")) {
          lastDropdown.click();

          const content = document.querySelector('.export-modal-content');
          content.scrollTop = content.scrollHeight;
        }
      }
    } else {
      if (dropdownCheckboxes.length > 0) {
        const lastCheckbox = dropdownCheckboxes[dropdownCheckboxes.length - 1];
        $(lastCheckbox).prop('checked', false);
      }
      
      if (dropdowns.length > 0) {
        const lastDropdown = dropdowns[dropdowns.length - 1];
        if (!lastDropdown.classList.contains("active")) {
          lastDropdown.click();
        }
      }
    }
  });

  document.addEventListener('click', function (event) {
    const modal = document.getElementById("export-modal");
    const additionalInfoModal = document.getElementById("additional-item-info-modal");
    const overlay = document.getElementById("overlay");

    const clickedOutsideBothModals = !modal.contains(event.target) && !additionalInfoModal.contains(event.target);
    
    if (clickedOutsideBothModals) {
      modal.style.display = "none";
      additionalInfoModal.style.display = "none";
      overlay.style.display = "none";
    }
  });

  $("#continue-btn").click(function () {
    
  });

  const descriptionField = document.getElementById("description-field");
  $("#view-item-details-btn").click(function (event) {
    event.stopPropagation();
    document.getElementById("context-menu").style.display = "none";
    document.getElementById("overlay").style.display = "block";
    document.getElementById("additional-item-info-modal").style.display = "flex";

    $.get("/projects/" + currentProjectId, function (data) {
      projectData = data;
      const selectedItemData = projectData.items.find(item => item.id === selectedItem && item.invoice_id === currentProjectId);

      const timeField = document.getElementById("time-field");
      const itemNameHeader = document.getElementById("item-name-header");
      timeField.textContent = selectedItemData.added_date;
      descriptionField.value = selectedItemData.expanded_description;
      itemNameHeader.textContent = selectedItemData.description;
    });

    
  });

  descriptionField.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      descriptionField.blur();
    }
  });

  descriptionField.addEventListener("blur", () => {
    if (descriptionField.value) {
      const updateData = {
        item: {
          id: selectedItem,
          dataType: "expanded_description",
          data: descriptionField.value,
        },
      };
      sendUpdateToServer(updateData, currentProjectId);
    }
  });

  const continueToExportBtn = document.getElementById("continue-to-export-btn");

  continueToExportBtn.addEventListener("click", function () {
    const checkedCheckboxes = document.querySelectorAll('.year-checkbox:checked');
    const monthsToExport = [];

    if (checkedCheckboxes.length == 0) {
      console.log("Select at least one");
      document.getElementById("export-error").display = "block";
    }

    else {
      checkedCheckboxes.forEach(checkbox => {
        const dataValue = checkbox.getAttribute('data-value');
        const [year, month] = dataValue.split(' '); 
        monthsToExport.push({ year, month });
      });
      
      
      console.log(monthsToExport);
    }
  });

});
