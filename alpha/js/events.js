CI.events = (function(){
    var aDmyDistance = null;
    var myDistance = 300;
    function init(){
        aDmyDistance = document.getElementById("myDistance");
        $('#myLocation').on('click', function(){
            myDistance = parseInt(aDmyDistance.value);
            CI.showMyPerimeter(myDistance);
        });
        $('#myListener').on('click', function(){
            CI.fetchValidCars();
        });
    }

    return{
        init: init
    }

})();

