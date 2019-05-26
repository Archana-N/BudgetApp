
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    };

    Expense.prototype.calculatePercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    var calculateTotalAmount = function(type) {
        var totalAmount = 0;

        data.allItems[type].forEach(function(currentItem) {
            totalAmount += currentItem.value;
        });

        data.totalAmounts[type] = totalAmount;
    }
   
    var data = {
        allItems: {
            expense: [],
            income: []
        },
        totalAmounts: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, itemDescription, itemValue) {
            var newItem, ID;
            /*  Logic for ID calculation:
                [1, 2, 3, 4, 5] => next ID = 6
                [1, 2, 4, 6] => next ID = 7
                Hence ID = last ID + 1 */

            // 1. Create new ID
            /* Having same names for the values of '+' and '-' mentioned in HTML and in the data structure 'data', 
               we can use the parameter 'type' directly as: 'data.allItems[type]' */            
            if(data.allItems[type].length > 0) {

                var lastItemIndex = data.allItems[type].length - 1;
                var lastItem = data.allItems[type][lastItemIndex];
                ID = lastItem.id + 1;
            }
            else {
                ID = 0;
            }         

            // 2. Create new item based on 'income' or 'expense' type
            // Here, the value of '+' and '-' mentioned in HTML is compared with
            if(type === 'expense') {
                newItem = new Expense(ID, itemDescription, itemValue);
            }
            else if(type === 'income') {
                newItem = new Income(ID, itemDescription, itemValue);
            }

            // 3. Push it into the data structure 
            data.allItems[type].push(newItem);

            // 4. Return the new element
            return newItem;
        },

        calculateBudget: function() {
            // 1. Calculate Total Income and Expenses
            calculateTotalAmount('income');
            calculateTotalAmount('expense');

            // 2. Calculate the Budget = Income - Expenses
            data.budget = data.totalAmounts.income - data.totalAmounts.expense;

            // 3. Calculate the Percentage of Income that we spent
            if(data.totalAmounts.income > 0) {
                data.percentage = Math.round((data.totalAmounts.expense / data.totalAmounts.income) * 100);
            }
            else {
                data.percentage = -1;
            }
            
            // Expense = 100; Income = 300; Percentage = (100 / 300) * 100 %
        },

        deleteItem: function(type, itemId) {
            var itemIds, index;

            itemIds = data.allItems[type].map(function(currentItem) {
                return currentItem.id;
            });

            index = itemIds.indexOf(itemId);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }            
        },

        calculatePercentages: function() {
            
            var totalExpenseIncome = data.totalAmounts.income;

            data.allItems.expense.forEach(function(currentItem) {
                currentItem.calculatePercentage(totalExpenseIncome);
            });
        },

        getPercentages: function() {

            var allPercentages = data.allItems.expense.map(function(currentItem) {
                return currentItem.getPercentage();
            });

            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totalAmounts.income,
                totalExpense: data.totalAmounts.expense,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }     
    }
})();


var UIController = (function() {

    var DOMConstants = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        buttonAdd: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expenseValue: '.budget__expenses--value',
        expensePercentage: '.budget__expenses--percentage',
        container: '.container',
        expenseItemPercentage: '.item__percentage',
        titleMonthYear: '.budget__title--month'
    };

    var formatValue = function(itemValue, type) {

        var amountSplit, integerPart, decimalPart;
        /*
            Add '+' or '-' before number
            Display to exactly upto 2 decimal points
            Separate the thousands with comma

            Ex:- 2310.4567 => 2,310.46
                 2000 => 2,000.00
        */

        itemValue = Math.abs(itemValue);
        itemValue = itemValue.toFixed(2);

        amountSplit = itemValue.split('.');

        integerPart = amountSplit[0];
        decimalPart = amountSplit[1];

        if(integerPart.length > 3) {
            integerPart = integerPart.substr(0, integerPart.length - 3) + ',' + 
                          integerPart.substr(integerPart.length -3, integerPart.length);  // Ex:- 23510 => 23,510
        }

        return (type === 'expense' ? '-' : '+') + ' ' + integerPart + '.' + decimalPart;
    };

    var nodeListForEach = function(list, callBack) {

        for(var i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMConstants.inputType).value, // Will be either "income" or "expense"
                description: document.querySelector(DOMConstants.inputDescription).value,
                value: parseFloat(document.querySelector(DOMConstants.inputValue).value)
            }
        },

        addListItem: function(item, type) {
            var html, newHtml, element;

            // 1. Create HTML string with Placeholder text
            if(type === 'income') {

                element = DOMConstants.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">            <i class="ion-ios-close-outline"></i> </button> </div> </div> </div>';
            }
            else if(type === 'expense') {

                element = DOMConstants.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i> </button> </div> </div> </div>';
            }
                            
            // 2. Replace the Placeholder text with some actual data
            newHtml = html.replace('%id%', item.id);
            newHtml = newHtml.replace('%description%', item.description);
            newHtml = newHtml.replace('%value%', formatValue(item.value, type));     

            // 3. Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        
        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMConstants.inputDescription + ', ' + DOMConstants.inputValue);

            // Convert 'fields' list to 'fieldsArray' array
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(currentElement, index, array) {
                currentElement.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(item) {

            var type = (item.budget > 0) ? 'income' : 'expense';
            
            document.querySelector(DOMConstants.budgetValue).textContent = formatValue(item.budget, type);
            document.querySelector(DOMConstants.incomeValue).textContent = formatValue(item.totalIncome, 'income');
            document.querySelector(DOMConstants.expenseValue).textContent = formatValue(item.totalExpense, 'expense');
            
            if(item.percentage > 0) {
                document.querySelector(DOMConstants.expensePercentage).textContent = item.percentage + '%';
            }   
            else {
                document.querySelector(DOMConstants.expensePercentage).textContent = '---';
            }        
        },

        displayPercentage: function(percentages) {
           
            var dispalyFields = document.querySelectorAll(DOMConstants.expenseItemPercentage);           

            nodeListForEach(dispalyFields, function(listItem, index) {

                if(percentages[index] > 0) {
                    listItem.textContent = percentages[index] + '%';
                }
                else {
                    listItem.textContent = '---';
                }
            });            
        },

        displayMonthYear: function() {
            var currentDate, currentMonth, formattedMonth, currentYear;

            currentDate = new Date();
            //currentMonth = currentDate.getMonth();            
            formattedMonth = Intl.DateTimeFormat('en-US', { month: 'long'}).format(currentDate);

            currentYear = currentDate.getFullYear();

            document.querySelector(DOMConstants.titleMonthYear).textContent = formattedMonth + ' ' + currentYear;
        },

        changedInputType: function() {

            var inputFields = document.querySelectorAll(DOMConstants.inputType + ',' +
                             DOMConstants.inputDescription + ',' +
                             DOMConstants.inputValue);

            nodeListForEach(inputFields, function(currentItem) {
                currentItem.classList.toggle('red-focus');
            });               

            document.querySelector(DOMConstants.buttonAdd).classList.toggle('red');
        },

        getDOMConstants: function() {
            return DOMConstants;
        }
    }
})();


var appController = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var uiDomConstants = UICtrl.getDOMConstants();

        document.querySelector(uiDomConstants.buttonAdd).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        /* 'Delete' button event bubbles up to '.container' DIV. => EVENT BUBLING.
           This event is then delegated to the target item which triggered the event. => EVENT DELEGATION.
           Here '.container' DIV element is chosen because, all the child 'Delete' buttons of both 'Income' and 'Expense' lists
           will bubble up to this parent DIV element which is common to both the lists. So only one Event Listener can be defined to 
           capture all the child 'Delete' button events  */
        document.querySelector(uiDomConstants.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(uiDomConstants.inputType).addEventListener('change', UICtrl.changedInputType);
    };
    
    var updateBudget = function() {
        // 1. Calculate the Budget
        budgetCtrl.calculateBudget();   

        // 2. Return the Budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the Budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the Budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentage(percentages);
    };
    
    var ctrlAddItem = function() {

        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the Budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and Update Budget
            updateBudget();

            // 6. Calculate and update Percentages
            updatePercentages();
        }        
    };

    var ctrlDeleteItem = function(event) {
        
        var itemID, splitItemID, type, ID;

        // 1. Get the element to delete
        // DOM Traversing -> traversing upto the parent element from the child element where event is triggered
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            splitItemID = itemID.split('-');
            type = splitItemID[0];
            ID = splitItemID[1]; 
            
            // 2. Delete the item from the data structure
            budgetCtrl.deleteItem(type, parseInt(ID));

            // 3. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 4. Update and show the new Budget
            updateBudget();

            // 5. Calculate and update Percentages
            updatePercentages();
        }       
    };

    return {
        init: function() {
            console.log('Application has started!');

            UICtrl.displayMonthYear();

            var defaultBudget = {
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            }

            UICtrl.displayBudget(defaultBudget);

            setupEventListeners();
        }
    };

})(budgetController, UIController);


appController.init();


