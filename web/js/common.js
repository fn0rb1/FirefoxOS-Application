$(document).ready(function() {
	window.screen.mozLockOrientation ("portrait-primary");
	document.querySelector("div[role='main']").style.height = "" + (screen.height - 74) + "px";
	
	listEventsHandler();
	
	eventDescriptionHandler();
	
	eventEditHandler();
	eventEditSaveHandler();
	eventDeleteHandler();
	eventSendHandler();
});

function backToIndex() {
	window.location.href ="index.html";
}

function yesExtiButtonHandler() {
	window.close ();
}

function showNewEvent() {
	window.location.href ="new.event.html";
}

function showEvent(id) {
	window.location.href ="event.html?desc=" + id;
}

function getURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
    	var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function eventDescriptionHandler() {
	if(!isNaN(getURLParameter("desc"))) {
		showDescription(getURLParameter("desc"));
	}
}

function listEventsHandler() {
	var database = window.indexedDB;
	var openDatabaseRequest = database.open("Events", 1);
	
	openDatabaseRequest.onupgradeneeded = function (event) {
	    var upgradeDatabase = event.currentTarget.result;
	    var upgradeDatabaseOS = upgradeDatabase.createObjectStore ("Events", {keyPath: "id", autoIncrement: true});
	    upgradeDatabaseOS.createIndex ("id", "id", {unique: true});
	};
	
	openDatabaseRequest.onsuccess = function () {
		var successDatabase = this.result;  
		var transaction = successDatabase.transaction ("Events", "readonly");
		    
		transaction.oncomplete = function () {
			successDatabase.close ();
		};
		  
		var successDatabaseOS = transaction.objectStore ("Events");
		var openCursorRequest = successDatabaseOS.openCursor ();
		openCursorRequest.onsuccess = function (event) {
			var cursor = event.target.result;
		    
		    if (cursor) {
		    	var dateOfEventDiv = $("<div class='dateOfEvent'></div>").text(cursor.value.date);
		    	var titleOfEventDiv = $("<textarea class='titleOfEvent' readonly></textarea>").text(cursor.value.title);
		    	var eventDiv = $("<div class='event' onclick='showEvent(" + cursor.value.id + ")'></div>").append(dateOfEventDiv, titleOfEventDiv);
		    	$("#listOfEvents").append(eventDiv);

		    	cursor.continue();
		    }	    
		};
		  
		openCursorRequest.onerror = function () {
			console.log ("Failed to open cursor when listEvents()");
		};
	}
	
	openDatabaseRequest.onerror = function() {
		console.log ("Failed to open database when listEvents()");
	};
}

function addEvent() {
	var database = window.indexedDB;  
	var openDatabaseRequest = database.open ("Events", 1);
	  
	openDatabaseRequest.onsuccess = function () {
		var successDatabase = this.result;
	    var transaction = successDatabase.transaction ("Events", "readwrite");
	    
	    transaction.oncomplete = function () {
	    	successDatabase.close ();
	    	navigator.vibrate(1000);
	    	window.location.href = "index.html";
	    };
	    
	    var databaseOS = transaction.objectStore ("Events");
	    var addRequest = databaseOS.add ({date: $("#newEventDate").val(), title: $("#newEventTitle").val(), description: $("#newEventDescription").val()});
	    
	    addRequest.onerror = function () {
	    	console.log ("Failed to add event when addEvent()");
	    };
	};
	  
	openDatabaseRequest.onerror = function () {
		console.log ("Failed to open database when addEvent()");
	};
}

function showDescription(id) {
	var database = window.indexedDB;
	var openDatabaseRequest = database.open("Events", 1);
	
	openDatabaseRequest.onsuccess = function () {
		var successDatabase = this.result;  
		var transaction = successDatabase.transaction ("Events", "readonly");
		    
		transaction.oncomplete = function () {
			successDatabase.close ();
		};
		  
		var successDatabaseOS = transaction.objectStore ("Events");
		var openCursorRequest = successDatabaseOS.openCursor ();
		openCursorRequest.onsuccess = function (event) {
			var cursor = event.target.result;
		    
		    if (cursor) {
		      if(cursor.value.id == id) {
		    	  $("#eventId").val(cursor.value.id);
		    	  $("#eventDescription").val(cursor.value.description);
		    	  $("#editEventTitle").val(cursor.value.title);
		    	  $("#editEventDate").val(cursor.value.date);
		    	  $("#editEventDescription").val(cursor.value.description);
		      }
		      cursor.continue();
		    }
		};
		  
		openCursorRequest.onerror = function () {
			console.log ("Failed to open cursor when showDescription()");
		};
	}
	
	openDatabaseRequest.onerror = function() {
		console.log ("Failed to open database when showDescription()");
	};
}

function eventEditHandler() {
	$("#eventEdit").click(function() {
		$("#eventContent").hide();
		$("#editEventContent").show();
		$("#eventBackHref").attr("href", "event.html?desc=" + $("#eventId").val());
	});
}

function eventEditSaveHandler() {
	$("#editEventSave").click(function() {
		var database = window.indexedDB;
		var openDatabaseRequest = database.open("Events", 1);
		
		openDatabaseRequest.onsuccess = function () {
			var successDatabase = this.result;  
			var transaction = successDatabase.transaction ("Events", "readwrite");
			    
			transaction.oncomplete = function () {
				successDatabase.close ();
				navigator.vibrate(1000);
				window.location.href = "event.html?desc=" + $("#eventId").val();
			};
			  
			var successDatabaseOS = transaction.objectStore ("Events");
			var openCursorRequest = successDatabaseOS.openCursor ();
			openCursorRequest.onsuccess = function (event) {
				var cursor = event.target.result;
			    
			    if (cursor) {
			      if(cursor.value.id == $("#eventId").val()) {
			    	  var updatedData = cursor.value;
			    	  updatedData.title = $("#editEventTitle").val();
			    	  updatedData.date = $("#editEventDate").val();
			    	  updatedData.description = $("#editEventDescription").val();
			    	  
			    	  var updateRequest = cursor.update(updatedData);
			    	  updateRequest.onerror = function() {
			    		  console.log ("Failed to update data when eventEditSaveHandler()");
			    	  }
			      }
			      cursor.continue();
			    }
			};
			  
			openCursorRequest.onerror = function () {
				console.log ("Failed to open cursor when eventEditSaveHandler()");
			};
		}
		
		openDatabaseRequest.onerror = function() {
			console.log ("Failed to open database when eventEditSaveHandler()");
		};
	});
}

function eventDeleteHandler() {
	$("#eventDelete").click(function() {
		$("#eventContent").hide();
		$("#deleteEventConfirm").show();
	});	
}

function hideDeleteEventConfirm() {
	$("#deleteEventConfirm").hide();
	$("#eventContent").show();
}

function deleteEventAction() {
	var database = window.indexedDB;
	var openDatabaseRequest = database.open("Events", 1);
	
	openDatabaseRequest.onsuccess = function () {
		var successDatabase = this.result;  
		var transaction = successDatabase.transaction ("Events", "readwrite");
		    
		transaction.oncomplete = function () {
			successDatabase.close ();
			navigator.vibrate(1000);
			window.location.href = "index.html";
		};
		  
		var successDatabaseOS = transaction.objectStore ("Events");
		var openCursorRequest = successDatabaseOS.openCursor ();
		openCursorRequest.onsuccess = function (event) {
			var cursor = event.target.result;
		    
		    if (cursor) {
		      if(cursor.value.id == $("#eventId").val()) {			    	  
		    	  var deleteRequest = cursor.delete();
		    	  deleteRequest.onerror = function() {
		    		  console.log ("Failed to delete data when eventDeleteHandler()");
		    	  }
		      }
		      cursor.continue();
		    }
		};
		  
		openCursorRequest.onerror = function () {
			console.log ("Failed to open cursor when eventDeleteHandler()");
		};
	}
	
	openDatabaseRequest.onerror = function() {
		console.log ("Failed to open database when eventDeleteHandler()");
	};
}

function eventSendHandler() {
	$("#eventSend").click(function() {
		var subject = encodeURIComponent($("#editEventTitle").val());
		var body = encodeURIComponent($("#editEventDate").val() + "  -  " + $("#editEventDescription").val());
		var emailActivityRequest = new MozActivity ({
			name: "new",
			data: {
			    type: "mail",
			    url: "mailto:?subject=" + subject + "&body=" + body
			  }
		});

		emailActivityRequest.onerror = function () {
			console.log ("Failed to open email when eventSendHandler()");
		};
	});
}