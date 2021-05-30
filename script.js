function newtd() {
    var n = document.getElementById('new').value
    console.log(n);
    var ni = document.getElementById('new').value;
    if (ni == "")
        return 0;

    var element = document.createElement('header');
    var x = document.createElement("input");
    x.setAttribute("type", "radio");
    element.appendChild(x);
    document.getElementById('main').style = "visibility:visible"
    element.appendChild(document.createTextNode(ni));
    element.id = "Hi"
    document.getElementById('main').appendChild(element);
    document.getElementById('new').value = "";
}