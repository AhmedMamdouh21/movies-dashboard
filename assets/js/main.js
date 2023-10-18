window.addEventListener('load', () => {
    const list = $(".list-data");
    const template = document.getElementById("list-item-template");
    const templateTable = document.getElementById("table-template");
    let btnSubmit = document.getElementById("btn-submit");
    let titleModalMovie = document.getElementById("titleModalFormMovie");
    let parentCategoryId;
    let getMovieId;
    let selectedValues;
    // Local Storage
    let dataCategories;
    let mood = "create";
    let tmp;
    let movieName = $("#movieName");
    let movieDescription = $("#movieDescription")

    /*** Fetch API ***/
    function getData() {
        loaderData();
        fetch("assets/json/Initial-data.json").then((result) => {
            let data = result.json();
            // console.log("data", data);
            return data;
        }).then((data) => {
            list.html('');

            if (localStorage.categories != null) {
                dataCategories = JSON.parse(localStorage.categories);
            } else {
                dataCategories = data.categories;
            }

            for (let i = 0; i < dataCategories.length; i++) {
                const item = template.content.cloneNode(true);
                item.querySelector(".title").textContent += `${dataCategories[i].name}`;
                item.querySelector(".add-movie").setAttribute("categoryId", [i]);
                for (let j = 0; j < dataCategories[i].movies.length; j++) {
                    const table = templateTable.content.cloneNode(true);
                    table.querySelector(".movie-name").textContent += `${dataCategories[i].movies[j].name}`;
                    table.querySelector(".movie-description").textContent += `${dataCategories[i].movies[j].description}`;
                    if (dataCategories[i].movies[j].tags) {
                        for (let tag = 0; tag < dataCategories[i].movies[j].tags.length; tag++) {
                            const tagElement = document.createElement('span');
                            tagElement.classList.add('tag')
                            tagElement.textContent += `${dataCategories[i].movies[j].tags[tag]}`;
                            table.querySelector(".tags").append(tagElement);
                        }
                    }
                    // Add attr Delete Button
                    // Movie Id
                    table.querySelector(".delete-movie").setAttribute("movieId", [j]);
                    // Category Id 
                    table.querySelector(".delete-movie").setAttribute("categoryId", [i]);
                    // Add attr Edit Button
                    // Movie Id
                    table.querySelector(".edit-movie").setAttribute("movieId", [j]);
                    // Category Id 
                    table.querySelector(".edit-movie").setAttribute("categoryId", [i]);
                    // tableResponsive.append(table);
                    // console.log(table);
                    item.querySelector("#tbody").append(table);

                }

                list.append(item);
            }

            // Save Local Storage
            localStorage.setItem("categories", JSON.stringify(dataCategories));

            // Click Delete Movie
            $(".delete-movie").on("click", function () {
                let categoryId = $(this).attr("categoryId");
                let movieId = $(this).attr("movieId");
                deleteMovie(categoryId, movieId)
            })

            // Click Button Add Movie
            $(".add-movie").on("click", function () {
                let categoryId = $(this).attr("categoryId");
                getId(categoryId);
                titleModalMovie.innerHTML = "Add Movie";
                btnSubmit.innerHTML = "Submit";
                mood = "create";
            });


            // Click Button Edit Movie
            $(".edit-movie").on("click", function () {
                let categoryId = $(this).attr("categoryId");
                let movieId = $(this).attr("movieId");
                editMovie(categoryId,movieId);
                titleModalMovie.innerHTML = "Edit Movie";
                btnSubmit.innerHTML = "Update";
                mood = "update";
                $('.modal-formMovie').on('shown.bs.modal', function () {
                    movieName.blur();
                    movieDescription.blur();
                }) 
            })
        }).catch(function (err) {
            console.warn('Something went wrong.', err);
        });

    }
    getData();

    /*** Add Category ***/

    // Validation * Submit Form
    $("#formAddCategory").validate({
       required: true,
       errorClass: "invalid",
       validClass: "success",
       rules: {
           category: {
               minlength: 2
           }
       },
       messages: {
           category: {
               required: "*Please Enter Category Name",
               minlength: "*Category Name at least 2 characters"
           }
       },
       submitHandler: (form) => {
           addCategory();
       }
   });

    function addCategory() {
        loaderData();
        let categoryName = $("#category");
        const category = template.content.cloneNode(true);
        category.querySelector(".title").textContent = categoryName.val();
        list.append(category);

        let newCategor = {
            id: dataCategories[dataCategories.length - 1].id + 1,
            name: categoryName.val(),
            movies: []
        }

        dataCategories.push(newCategor);
        //  Save  Local Storage
        localStorage.setItem("categories", JSON.stringify(dataCategories));
        // console.log("newCategor", newCategor);
        categoryName.val("");
        // Update Data
        getData();
    }


    /*** Delete Movie ***/
    function deleteMovie(categoryId, movieId) {
        dataCategories[categoryId].movies.splice(movieId, 1);
        localStorage.setItem("categories", JSON.stringify(dataCategories));
        // Update Data
        getData();
    }

    /*** Get Category Id & Movie Id ***/
    function getId(categoryId, movieId) {
        parentCategoryId = categoryId;
        getMovieId = movieId;
    }

    /*** Add Movie ***/
    ;
    $("#formMovie").validate({
        required: true,
        errorClass: "invalid",
        validClass: "success",
        rules: {
            movieName: {
                minlength: 2
            },
            movieDescription: {
                minlength: 10
            }
        },
        messages: {
            movieName: {
                required: "*Please Enter Name",
                minlength: "*Name at least 2 characters"
            },
            movieDescription: {
                required: "*Please Enter Description",
                minlength: "*Description at least 10 characters"
            }
        },
        submitHandler: (form) => {
            formMovieSubmit();
        }
    });
    
    function formMovieSubmit() {
        let newMovie = {
            id: dataCategories[dataCategories.length - 1].id + 1,
            name: movieName.val(),
            tags: selectedValues,
            description: movieDescription.val(),
        }
        if (mood == "create") {
            dataCategories[parentCategoryId].movies.push(newMovie);
        } else if (mood == "update") {
            dataCategories[parentCategoryId].movies[tmp] = newMovie;
        } 
        //  Save  Local Storage
        localStorage.setItem("categories", JSON.stringify(dataCategories));
        $('.modal-formMovie').modal('hide');
        // Update Data
        getData();
    }
    // Close Modal  Clear Inputs
    $(".modal-formMovie").on("hidden.bs.modal", function (e) {
        clearMovieInput();
    });
    /*** Clear Inputs ****/ 
    function clearMovieInput() {
        movieName.val("");
        movieDescription.val("");
        selectedValues = [];
        $('select').selectpicker('deselectAll');
    }
    /*** Edit Movie ***/
    function editMovie(categoryId, movieId) {
        movieName.val(dataCategories[categoryId].movies[movieId].name);
        movieDescription.val(dataCategories[categoryId].movies[movieId].description);
        selectedValues = dataCategories[categoryId].movies[movieId].tags; 
        $('select').selectpicker('val', selectedValues);
        // console.log("id",movieId);
        tmp = movieId;
        parentCategoryId = categoryId;
    }
    /*** Select ***/
    if ($("select").length) {
        $("select").selectpicker();
        $('select').on('change', function(){
            selectedValues = $(this).val();
            // console.log("selectedValues",selectedValues);
        });
    }


    /*** Toggle ***/
    $(".toggle-sidebar").on("click", function () {
        $(this).toggleClass('open');
        $('.sidebar').toggleClass('show');
    })

    /*** Loader Data ***/
    function loaderData() {
        let loader = $('.loader-data');
        loader.fadeIn();
        setTimeout(() => {
            loader.fadeOut();
        }, 1500);
    } 

    
})