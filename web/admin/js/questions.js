//start on page 0 i.e. human page 1
let pageNum = 0
let maxPages = 0

const howManyPerPage = 10
const maxPaginationButtons = 5

let jsonURL = `../api/questions/`

let urlParams = new URLSearchParams(window.location.search)
let searchTerm = urlParams.get('search')

if (searchTerm)
{
	jsonURL = `../api/questions/search?searchby=${searchTerm}`
}

let tableHeaders = ["Question","Answer - Points","Actions"]
let tableData


function loadEditModal(modal,id) {
	console.log(id)
	
	if ($('#updateModalFooter').children().last().hasClass("btn-primary")){
		$('#updateModalFooter').children().last().remove()
	}

	$.ajax({
		url : `../api/question/modal?id=${id}`,
		type : 'GET',
		dataType:'html',
		success : function(data) {              
			let divContainer = document.getElementById(modal)
			divContainer.innerHTML = data
			
			let saveButton = `<button type="button" class="btn btn-primary" onclick="saveUpdatedQuestion('${id}')">Save</button>`
			let divButtonContainer = document.getElementById("updateModalFooter")
			divButtonContainer.innerHTML += saveButton
			
			$('#editModal').modal({
				show : true
			})
		}
	})
}

function deleteQuestionModal(id) {
	console.log(id)
	
	let deleteButton = `<button type="button" class="btn btn-danger" onclick="deleteQuestion('${id}')" >Delete</button>`
	
	if ($('#deleteModalFooter').children().last().hasClass("btn-danger")){
		$('#deleteModalFooter').children().last().remove()
	}
            
	let divContainer = document.getElementById("deleteModalFooter")
	divContainer.innerHTML += deleteButton
    
	$('#deleteModal').modal({
		show : true
	})
	
}

function deleteQuestion(id){
	console.log(`Delete ${id}`);
	$('#deleteModalFooter').children().last().remove();
	$.ajax({
		url : `../api/question?id=${id}`,
		type : 'DELETE',
		dataType:'html',
		success : function(data) {              
			let divContainer = document.getElementById(modal)
			divContainer.innerHTML = data
			$('#editModal').modal({
				show : true
			})
		}
	})
	// Hide the modal once the question has been deleted
	$('#deleteModal').modal('hide')
	location.reload()
}

function saveUpdatedQuestion(id){
	console.log(`Save ${id}`);
    let questionJSON = getQuestionJSON("modalEditBody", id)

	$.ajax({
		url : `../api/questions`,
		type : 'POST',
		dataType:'json',
		data: questionJSON,
		success : function(data) {
			// Close the modal and remove the specific save button after the question has been updated from the database              
			$('#editModal').modal('hide')
			$('#updateModalFooter').children().last().remove()
			location.reload()
		}
	})
}

function saveNewQuestion(){
	console.log(`Save New Question`)
	$('#newQuestionModal').modal('hide')
}

function getQuestionJSON(modal, id)
{
    var questionJSON = {};
    //get the main div
	questionJSON['_id'] = id

    //get the question
    questionJSON['question'] = document.getElementById(modal).getElementsByTagName('div')[0].getElementsByTagName('textarea')[0].value;
    //start at two to skip headers
    var answerArray = [];
    var divs = document.getElementById(modal).getElementsByTagName('div');
    for(i = 3; i < divs.length; i++)
    {
        var inputs = divs[i].getElementsByTagName('input');
        var answer = {}
        //answer
        answer['text'] = inputs[0].value;
        //points
        answer['pts'] = inputs[1].value;
        answerArray.push(answer);
    }
    questionJSON['answer'] = answerArray;
    return questionJSON;
}

$(document).ready(function() {
	$('[data-toggle="tooltip"]').tooltip()
	
	if (searchTerm){
		$('#searchBar').val(searchTerm)
	}

	let divContainer = document.getElementById("mainTableDivCenter")
		divContainer.innerHTML = "<div class='loader'></div>"
		
	$.ajax({
		url : jsonURL,
		type : 'GET',
		dataType:'json',
		success : function(data) {              
			tableData = data
			buildHtmlTable(tableHeaders, data, "mainTableDiv")
    	},
		error : function(request,error){
		let divContainer = document.getElementById("mainTableDiv")
		divContainer.innerHTML += "Something went wrong!"
    	}
	})
})

function changeToReadable(header, data) {
	if (header === "Answer - Points") {
		let text = ""

		for (awn in data['answer']){
			text += `${data['answer'][awn]['text']} - ${data['answer'][awn]['pts']}<br>`
		}
		return text
	}
	if (header === "Question") {
		return data['question']
	}
	if (header === "Actions") {
		return `<i class='fa fa-pencil actionButton' onclick="loadEditModal('modalEditBody', '${data['_id']}')"></i> <i class="fa fa-times actionButton" onclick="deleteQuestionModal('${data['_id']}')" style="color:red;"></i>`
	}

	return ""
}

function buildHtmlTable(headerArray, dataArray, div) {

	let table = document.createElement("table")
	table.setAttribute("class", "questionTable")
	table.setAttribute("id", "questionTable")

	tr = table.insertRow(-1)
	for (let i = 0; i < tableHeaders.length; i++) {
		// Col Titles
		let th = document.createElement("th")
		th.innerHTML = tableHeaders[i]
		tr.appendChild(th)
	}
	// If the data is less than 10 rows then use the array length
	let rows = howManyPerPage
	if (dataArray.length < howManyPerPage) {
		rows = dataArray.length
	}
	// Create the Rows
	for (let i = 0; i < rows; i++) {
		tr = table.insertRow(-1)
		for (let j = 0; j < tableHeaders.length; j++) {
			let tabCell = tr.insertCell(-1)
			tabCell.innerHTML = changeToReadable(tableHeaders[j], dataArray[i])
		}
	}
	let divContainer = document.getElementById(div)
	divContainer.innerHTML = ""
	divContainer.appendChild(table)
	// Table has been created let check to see if we need pagination
	if (dataArray.length > howManyPerPage) {
		maxPages = Math.ceil((dataArray.length / howManyPerPage)) - 1
		createPaginationButtons(dataArray.length)
	}
}

function createPaginationButtons(numOfItems) {
	let content = "<div id='paginationButtons'>"
	content += "	<nav aria-label='pagination'>"
	content += "		<ul id='paginationItems' class='pagination pagination-sm justify-content-end' style='margin:15px 0'>"
	content += "		    <li class='page-item disabled'><a class='page-link' href='#' tabindex='-1' onclick='paginationClick(this); return false';>Previous</a></li>"
	content += "		    <li class='page-item active'><a class='page-link' href='#' onclick='paginationClick(this); return false;'>1</a></li>"
	if (maxPages > maxPaginationButtons) {
		content += "		    <li class='page-item'><a class='page-link' href='#' onclick='paginationClick(this); return false;'>2</a></li>"
		content += "		    <li class='page-item'><a class='page-link' href='#' onclick='paginationClick(this); return false;'>3</a></li>"
		content += "		    <li class='page-item'><a class='page-link' href='#' onclick='paginationClick(this); return false;'>4</a></li>"
		content += "		    <li class='page-item'><a class='page-link' href='#' onclick='paginationClick(this); return false;'>5</a></li>"
	} else {
		for (let i = 0; i < maxPages; i++) {
			content += `		    <li class='page-item'><a class='page-link' href='#' onclick='paginationClick(this); return false;'>${(i + 2)}</a></li>`
		}
	}
	content += "    		<li class='page-item'><a class='page-link' href='#' onclick='paginationClick(this); return false;'>Next</a></li>"
	content += "		</ul>"
	content += "	</nav>"
	content += "</div>"
	let divAfterTable = document.getElementById("mainTableDiv")
	divAfterTable.insertAdjacentHTML('afterend', content)
}

function updateTable(data, tableID, tableHeaders, page) {
	let table = document.getElementById(tableID)
	for (let i = 1, row; row = table.rows[i]; i++) { // Start on row 1
		for (let j = 0, col; col = row.cells[j]; j++) {
			let arrayIndex = ((i - 1) + (page * howManyPerPage))
			
			if(arrayIndex < data.length){
				col.innerHTML = changeToReadable(table.rows[0].cells[j].innerHTML, data[arrayIndex])
			}else{
				col.innerHTML = ""
			}
		}
	}
}

function paginationClick(ele) {
	let pageinationButtons = document.getElementById("paginationItems").getElementsByTagName("li")
	
	if (ele.innerHTML === "Next") {
		if (pageNum < maxPages) {
			pageNum++
		}
		if (pageinationButtons[pageinationButtons.length - 2].classList.contains("active")){
			for (let i = 1; i < pageinationButtons.length - 1; i++){
				let newLabel = (parseInt(pageinationButtons[i].getElementsByTagName("a")[0].innerHTML)) + 1
				pageinationButtons[i].getElementsByTagName("a")[0].innerHTML = newLabel
			}
		}
	}
	if (ele.innerHTML === "Previous") {
		if (pageNum !== 0) {
			pageNum--
		}
		
		if (pageinationButtons[1].classList.contains("active")){
			for (let i = 1; i < pageinationButtons.length - 1; i++){
				let newLabel = (parseInt(pageinationButtons[i].getElementsByTagName("a")[0].innerHTML)) - 1
				pageinationButtons[i].getElementsByTagName("a")[0].innerHTML = newLabel
			}
		}
	}
	
	if (ele.innerHTML !== "Previous" && ele.innerHTML !== "Next")
	{
		let pageNumber = parseInt(ele.innerHTML) - 1
		
		if (pageNumber <= maxPages){
			pageNum = pageNumber
		}
	}
	
	if (pageNum < maxPages) {
		pageinationButtons[0].classList.remove("disabled")
		pageinationButtons[pageinationButtons.length - 1].classList.remove("disabled")
	}
	if (pageNum === 0) {
		pageinationButtons[0].classList.add("disabled")
	}
	if (pageNum === maxPages) {
		pageinationButtons[pageinationButtons.length - 1].classList.add("disabled")
		pageinationButtons[0].classList.remove("disabled")
	}
	
	for (let i = 1; i < pageinationButtons.length - 1; i++){
		
		if ((parseInt(pageinationButtons[i].getElementsByTagName("a")[0].innerHTML) - 1) === pageNum){
			pageinationButtons[i].classList.add("active")
		}else{
			pageinationButtons[i].classList.remove("active")
		}
	}
	
	updateTable(tableData, "questionTable", tableHeaders, pageNum)
}