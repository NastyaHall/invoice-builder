let eyeIconLogin = document.getElementById("eye-icon-login");
let eyeIconSignUp = document.getElementById("eye-icon-sign-up");

const passwordInputLogin = document.getElementById("password");
const emailInputLogin = document.getElementById("email");

const passwordInputSignUp = document.getElementById("password1");
const emailInputSignUp  = document.getElementById("email1");

function ShowPassword(passwordInput, eyeIcon) {
    if (passwordInput) {
        if (passwordInput.type == "password") {
            passwordInput.type = "text";
            eyeIcon.src = "static/eye.svg";
        } else {
            passwordInput.type = "password";
            eyeIcon.src = "static/eye-slash.svg";
        }
    }
}

eyeIconLogin.addEventListener("click", function () {
    ShowPassword(passwordInputLogin, eyeIconLogin);
});

eyeIconSignUp.addEventListener("click", function () {
    ShowPassword(passwordInputSignUp, eyeIconSignUp);
});


// Add an event listener to the input fields
passwordInputLogin.addEventListener("input", function () {
    const passwordError = document.getElementById("loginPasswordErrorMessage");

    // Remove error styles when the user starts typing
    passwordError.textContent = "";
    passwordInputLogin.classList.remove("error-border");
    passwordInputLogin.classList.remove("valid");
    passwordError.textContent = "";
});

emailInputLogin.addEventListener("input", function () {
    const emailError = document.getElementById("loginEmailErrorMessage");

    // Remove error styles when the user starts typing
    emailError.textContent = "";
    emailInputLogin.classList.remove("error-border");
    emailInputLogin.classList.remove("valid");
    emailError.textContent = "";
});


passwordInputSignUp.addEventListener("input", function () {
    const passwordError = document.getElementById("signUpPasswordErrorMessage");

    // Remove error styles when the user starts typing
    passwordError.textContent = "";
    passwordInputSignUp.classList.remove("error-border");
    passwordInputSignUp.classList.remove("valid");
    passwordError.textContent = "";
});

emailInputSignUp.addEventListener("input", function () {
    const emailError = document.getElementById("signUpEmailErrorMessage");

    // Remove error styles when the user starts typing
    emailError.textContent = "";
    emailInputSignUp.classList.remove("error-border");
    emailInputSignUp.classList.remove("valid");
    emailError.textContent = "";
});




document.getElementById('login-link').addEventListener('click', function (event) {
    // Prevent the default behavior of the link
    event.preventDefault();

    // Update the URL
    history.pushState(null, null, '/login');
});

document.getElementById('sign-up-link').addEventListener('click', function (event) {
    // Prevent the default behavior of the link
    event.preventDefault();

    // Update the URL
    history.pushState(null, null, '/sign-up');
});

$(document).ready(function() {
    // Check if the URL contains "/login"
    if (window.location.href.indexOf("/login") !== -1) {
      // If the condition is met, show the modal
      $('#modal').modal('show');
    }
    if (window.location.href.indexOf("/sign-up") !== -1) {
        // If the condition is met, show the modal
        $('#modal-sign-up').modal('show');
    }
    
    $(document).on('click', function(e) {
        if ($(e.target).is('.modal')) {
          // Modify the URL to "/"
          window.history.replaceState({}, document.title, "/");
        }
      });
  });


  $(document).ready(function() {
    $('#form-login').on('submit', function(e) {
      e.preventDefault(); // Prevent the default form submission
      
      // Gather user input
      var username = $('#email').val();
        var password = $('#password').val();
      
      // Send login request to the server using AJAX
      $.ajax({
        url: '/login', // Your server endpoint
        method: 'POST',
        data: { email: username, password: password },
        success: function(response) {
          // Assuming your server returns JSON with keys like 'success' and 'message'
            if (response.success) {
                $('#modal').modal('hide'); // Close the modal
            window.location.href = '/'; // Redirect to the dashboard
            } else {
                console.log('fail');
                if (response.for_item == "password")
                    $('#loginPasswordErrorMessage').text(response.message);
                else if (response.for_item == "email")
                    $('#loginEmailErrorMessage').text(response.message);
          }
        },
        error: function() {
          // Handle AJAX error
          alert('An error occurred during login.');
        }
      });
    });
  });
  
  $(document).ready(function() {
    $('#sign-up-form').on('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        // Gather user input
        var email = $('#email1').val();
        var password = $('#password1').val();
        var first_name = $('#firstName').val();

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(password)) {
            $('#signUpPasswordErrorMessage').text("Password must be at least 8 characters long");
            document.getElementById("password1").classList.add("error-border");
        } else {
            document.getElementById("password1").classList.remove("error-border");
            document.getElementById("password1").classList.add("valid");
            $('#signUpPasswordErrorMessage').text("");
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            $('#signUpEmailErrorMessage').text("Invalid email address.");
            document.getElementById("email1").classList.add("error-border");
        } else {
            document.getElementById("email1").classList.remove("error-border");
            document.getElementById("email1").classList.add("valid");
            $('#signUpEmailErrorMessage').text("");
        }

        // Check if there are validation errors and prevent form submission
        if ($('#signUpPasswordErrorMessage').text() || $('#signUpEmailErrorMessage').text()) {
            e.preventDefault();
        } else {
            // Send login request to the server using AJAX
            $.ajax({
                url: '/sign-up', // Your server endpoint
                method: 'POST',
                data: { email: email, password: password, firstName: first_name },
                success: function(response) {
                    if (response.success) {
                        $('#modal').modal('hide'); 
                        window.location.href = '/'; 
                    } else {
                        console.log('fail');
                        if (response.for_item == "password")
                            $('#signUpPasswordErrorMessage').text(response.message);
                        else if (response.for_item == "email")
                            $('#signUpEmailErrorMessage').text(response.message);
                    }
                },
                error: function() {
                    alert('An error occurred during sign-up.');
                }
            });
        }
    });
});
