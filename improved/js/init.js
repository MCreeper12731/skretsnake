document.addEventListener("DOMContentLoaded", function() {
    // Ta del kode se zazene na zacetku

    // Poskrbimo za pravilno raztegovanje okna
    let doResize = function() {
        let canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.init(canvas);
    };
    window.addEventListener("resize", doResize);
    doResize()
    // Zazenemo glavni del programa (ki ga sprogramirate vi)
    window.main();
});
