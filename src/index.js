/* Fetch data from source */
fetch('https://raw.githubusercontent.com/StrategicFS/Recruitment/master/data.json')
    .then(response => response.json())
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            generateRow(data[i]);
        }
    })
    .catch(err => {
        console.log("Failed to fetch data.", err);
    })

/* Toggle variable to generate input row or data row */
var addToggle = false;
/* Toggle variable for checking/unchecking all boxes */
var mainCheckboxToggle = false;
/* Array to keep track of selected rows */
var rowArr = [];
/* Counter for total rows */
var totalRows = 0;

const addButton = document.getElementById("add-btn");
const removeButton = document.getElementById("remove-btn");
const checkAllToggler = document.getElementById("main-checkbox");
const table = document.getElementById("table");
const columns = ["creditorName", "firstName", "lastName", "minPaymentPercentage", "balance"];

addButton.addEventListener("click", addRow);
removeButton.addEventListener("click", removeRow);
checkAllToggler.addEventListener("change", toggleAllBoxes);

/* Create table cells for each row header */     
function generateRow(data) {
    const row = document.createElement("tr");
    table.append(row);

    for (let i = 0; i < columns.length; i++) {
        const cell = document.createElement("td");
        const cellData = data[columns[i]];

        /* Format text and number inputs accordingly */
        if ((columns[i] === "minPaymentPercentage" || columns[i] === "balance") 
            && cellData !== "") {
            let numValue = parseFloat(cellData);
            
            /* Output number according to field and input */
            if (numValue < 0 && columns[i] === "balance") {
                numValue = `-$${(numValue*-1).toFixed(2)}`;
            } else if (columns[i] === "balance"){
                numValue = `$${numValue.toFixed(2)}`;
            } else {
                numValue = `${numValue.toFixed(2)}%`;
            }

            cell.innerHTML = numValue;
            cell.classList.add("number-cells");
        } else {
            cell.innerHTML = cellData;
        }

        cell.classList.add("data-cell");
        row.append(cell);
    }

    totalRows++;
    displayTotalRows();
    row.prepend(generateCheckBox());
    checkAllToggler.checked = false;
    mainCheckboxToggle = false;
}

/* Generate Check box for each row */
function generateCheckBox() {
    let checkBoxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.classList.add("sub-checkbox");
    checkBoxCell.append(checkbox);
    
    /* Toggle main checkbox according to sub-checkboxes */
    checkbox.addEventListener("change", (e) => {
        checkedBoxList(e);
        displayTotalSelectedRows();
        if (rowArr.length === totalRows) {
            checkAllToggler.checked = true;
            mainCheckboxToggle = true;
        } else if (mainCheckboxToggle) {
            checkAllToggler.checked = false;
            mainCheckboxToggle = false;
        }
    });

    return checkBoxCell;
}

function checkedBoxList(e) {
    const row = e.target.parentNode.parentNode;
    const index = rowArr.indexOf(row);
    let property;

    if (index !== -1) {
        rowArr.splice(index, 1);
        property = "remove";
    } else {
        rowArr.push(row);
        property = "add";
    }

    for (let i = 1; i < row.children.length; i++) {
        row.children[i].classList[property]("selected-row");
    }

    /* Adjust balance total when toggling main check box */
    displayTotal();
}

function addRow() {
    addToggle = !addToggle;
    /* Add row for inputs on first click */
    if (addToggle) {
        generateInputRow();
    } else {
        const inputRowData = formatInputRowData(table.lastChild);
        table.lastChild.remove();
        
        // generate row only if all field's are not considered empty or just whitespace
        if (Object.values(inputRowData).some(string => /\S/.test(string))) {
            generateRow(inputRowData);
        } 
    }
}

function generateInputRow() {
    const column = ["Creditor", "First Name", "Last Name", "Min Pay %", "Balance"];
    const row = document.createElement("tr");
    table.append(row);
    
    for (let i = 0; i < column.length; i++) {
        const col = column[i];
        const type = (col === "Min Pay %" || col === "Balance") ? "number" : "text";
        const cell = document.createElement("td");
        const input = document.createElement("input");
        /* Combine cells onto the same row before adding onto table */

        cell.classList.add("input-cell");
        input.classList.add(`${columns[i]}`);
        input.setAttribute("type", type);
        input.setAttribute("placeholder", column[i]);
        input.setAttribute("size", 18);        
        cell.append(input);
        row.append(cell);
    }
    row.prepend(document.createElement("td"));
}

function formatInputRowData(lastRow) {
    const inputs = lastRow.children;
    let data = {
        creditorName: "",
        firstName: "",
        lastName: "",
        minPaymentPercentage: "",
        balance: ""
    };

    /* Format data into correct structure */
    /* start at 1 to ignore empty front cell */
    for (let i = 1; i < inputs.length; i++) {
        let value = inputs[i].children[0].value;
        let key = inputs[i].children[0].classList[0];
        data[key] = value;
    }

    return data;
}

/* Remove all selected rows within selected row arr */
function removeRow() {
    for (let i = 0; i < rowArr.length; i++) {
        rowArr[i].remove();
        totalRows--;
    }

    rowArr = [];
    checkAllToggler.checked = false;
    mainCheckboxToggle = false;
    displayTotal();
    displayTotalRows();
    displayTotalSelectedRows();
}

function toggleAllBoxes() {
    const allCheckboxes = document.getElementsByClassName("sub-checkbox");
    let property;
    mainCheckboxToggle = !mainCheckboxToggle;
    rowArr = [];
    
    /* Select/deselect all check boxes whenever you select/deselect main checkbox */
    for (let i = 0; i < allCheckboxes.length; i++) {
        const row = allCheckboxes[i].parentNode.parentNode;
        allCheckboxes[i].checked = mainCheckboxToggle;

        if (mainCheckboxToggle) {
            rowArr.push(row);
            property = "add"
        } else {
            property = "remove"
        }

        for (let i = 1; i < row.children.length; i++) {
            row.children[i].classList[property]("selected-row");
        }  
    }
    /* Adjust balance total when toggling main check box */
    displayTotal();
    displayTotalSelectedRows();
}

/* Display balance total of all selected rows */
function displayTotal() {
    let total = 0;
    /* Add/Subtract total according to selected rows according to positive/negative balance */
    rowArr.forEach( (row) => {
        if (row.lastChild.innerHTML !== "" && row.lastChild.innerHTML.indexOf("-") === -1){
            total += parseFloat(row.lastChild.innerHTML.split("$")[1]);
        } else if (row.lastChild.innerHTML.indexOf("-") !== -1) {
            total -= parseFloat(row.lastChild.innerHTML.split("$")[1]);
        }
    })

    /* Format to display correctly whether positive/negative balance */
    const totalText = formatNumber(total);
    document.getElementById("total-balance").innerHTML = totalText;
}

/* Display number or rows made */
function displayTotalRows(){
    document.getElementById("row-counter").innerHTML = totalRows;
}

/* Display number of rows selected */
function displayTotalSelectedRows(){
    document.getElementById("selected-counter").innerHTML = rowArr.length;
}

/* Format pos/neg total accordingly with signs and commas */
function formatNumber(num) {
    let pos = true;
    
    /* Format numbers that should have commas or negatives */
    if(num > 999 || num < 0 ) {
        const commaIndexes = [];
        
        if (num < 0) {
            pos = false;
            num *= -1;
        }

        const arr = num.toFixed(2).split(".");
        const dollars = arr[0].split("");
        const cents = arr[1].split("");
        let counter = 0;
        let moveIndex = 0;

        /* Loop through numbers in dollars and find indexes of commas*/
        for(let i = dollars.length-1; i > 0; i--) {
            counter++;
            if (counter % 3 === 0) {
                commaIndexes.push(i);
            }
        }

        /* Add commas into dollars array, adjust index after adding comma */
        for(let i = commaIndexes.length-1; i >= 0; i--) {
            dollars.splice((commaIndexes[i]+moveIndex), 0, ",");                    
            moveIndex++;
        }

        const sign = pos ? "$" : "-$";            
        return (sign + dollars.join("") + "." + cents.join(""));

    } 
    /* Format number regularly with $ sign */
    else {
        return `$${num.toFixed(2)}`;
    }
}
