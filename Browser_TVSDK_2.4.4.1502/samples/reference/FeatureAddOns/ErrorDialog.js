/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
/**
 * This function is used for showing custom error message dialog box anywhere you want. This function(ShowCustomDialog) takes
 * 8 parameters,
 *  @title       :      Title of message box , must be a string
 *  @message     :      Message in message box
 *  @parentDivId :      ParentDivId , this is used a reference for message box as message box will take dimentions of parent div , top , left , width , height
 *  @height,@width,@leftPos and @topPos : are parameters which will be used if we specify parentDivId as blank eg ('').
 *  @isDragable  : is optional field and can take only 2 values true or false. If you do not specify this field than by default it will be false
 *  @isModal     : is optional field and can take only 2 values true or false. If you do not specify this field than by default it will be true
 */

function ShowCustomDialog(title, message, parentDivId , height , width , leftPos , topPos, isDragable , isModal)
{
   //heightAdjustment = window.pageYOffset;
    if (typeof isDragable === "undefined")
    {
        isDragable = false;
    }
    if (typeof isModal === "undefined")
    {
        isModal = true;
    }
    if(parentDivId == '')
    {
        ShowDialogBox(title,message,height , width , leftPos , topPos , isDragable , isModal);
    }
    else
    {
        width = document.getElementById(parentDivId).offsetWidth;
        width = width/2;
        height =  document.getElementById(parentDivId).offsetHeight;
        height = height/2;
        leftPos = document.getElementById(parentDivId).offsetLeft + width/2;
        topPos = document.getElementById(parentDivId).offsetTop + height/2;
        ShowDialogBox(title,message,height, width,leftPos,topPos , isDragable , isModal);
    }
}

function ShowDialogBox(title, content, pheight , pwidth , leftPos , topPos , isDragable , isModal) {
    var customErrorDialog = document.getElementById('customErrorDialog');
    if(customErrorDialog === null) { //error dialog is not already present. create a new one.
        createDialog(title, content);
        var customErrorDialogContent = document.getElementById('customErrorDialogContent');
        var customErrorDialogHeader = document.getElementById('customErrorDialogHeader');
        if(customErrorDialogContent)
        {
            customErrorDialogContent.style.width = pwidth+"px";
            customErrorDialogContent.style.height = pheight+"px";
            customErrorDialogContent.style.left = leftPos+"px";
            customErrorDialogContent.style.top = topPos+"px";
        }
        if(isDragable)
            makeDialogDraggable(customErrorDialogHeader, customErrorDialogContent);
    }        
}

function createDialog(title, content)
{
    var customErrorDialog = document.createElement("div");
    customErrorDialog.className = 'custom-error-dialog';
    customErrorDialog.id = 'customErrorDialog';
    var customErrorDialogContent = document.createElement("div");
    customErrorDialogContent.className = 'custom-error-dialog-content';
    customErrorDialogContent.id = 'customErrorDialogContent';
    var mydialog = 
            '<div class="custom-error-dialog-header" id="customErrorDialogHeader">'+
                '<div class="close" id="close">×</div>'+
                '<p>'+title+'</p>'+
            '</div>'+
            '<div class="custom-error-dialog-body" id="customErrorDialogBody">'+
                '<p>'+content+'</p>'+
            '</div>';
      
    customErrorDialogContent.innerHTML = mydialog;
    document.body.appendChild(customErrorDialog);
    document.body.appendChild(customErrorDialogContent);
    var close = document.getElementById('close');
    close.onclick = function() {
        document.body.removeChild(customErrorDialog);
        document.body.removeChild(customErrorDialogContent);
    }
}

function makeDialogDraggable(onDragElement, toDragElement)
{
    if(onDragElement && toDragElement)
    {    
        var selected = null, // Object of the element to be moved
        x_pos = 0, y_pos = 0, // Stores x & y coordinates of the mouse pointer
        x_elem = 0, y_elem = 0; // Stores top, left values (edge) of the element

        onDragElement.setAttribute("style", "cursor:move;"); //make cursor movable for onDragElement

        // Will be called when user starts dragging an element
        function _drag_init(elem) {
            selected = elem;
            x_elem = x_pos - selected.offsetLeft;
            y_elem = y_pos - selected.offsetTop;
        }

        // Will be called when user dragging an element
        function _move_elem(e) {
            x_pos = document.all ? window.event.clientX : e.pageX;
            y_pos = document.all ? window.event.clientY : e.pageY;
            if (selected !== null) {
                selected.style.left = (x_pos - x_elem) + 'px';
                selected.style.top = (y_pos - y_elem) + 'px';
            }
        }

        // Destroy the object when we are done
        function _destroy() {
            selected = null;
        }
        
        onDragElement.onmousedown = function () {
            _drag_init(toDragElement);
            return false;
        }
        document.onmousemove = _move_elem;
        document.onmouseup = _destroy;
    }
}

function getMessegeFromID(code)
{
    return ReferencePlayer.ErrorCodes.entries[0][code].msg;
}

function getcodeFromID(code)
{
    return ReferencePlayer.ErrorCodes.entries[0][code].code;
}