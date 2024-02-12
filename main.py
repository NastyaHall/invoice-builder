from website import create_app
from website.auth import auth

app = create_app()
from flask_mail import Mail
mail = Mail(app)

if __name__ == '__main__':
    app.run(port=8000, debug=True)