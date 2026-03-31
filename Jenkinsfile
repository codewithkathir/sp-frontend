pipeline {
    agent any

    environment {
        PROJECT_DIR = "/var/www/jenkins/sp-frontend"
    }

    stages {

        stage('Setup Repo') {
            steps {
                sh '''
                if [ ! -d "$PROJECT_DIR/.git" ]; then
                    git clone https://github.com/codewithkathir/sp-frontend.git $PROJECT_DIR
                else
                    cd $PROJECT_DIR
                    git reset --hard
                    git pull origin main
                fi
                '''
            }
        }

        stage('Install') {
            steps {
                sh '''
                cd $PROJECT_DIR
                npm install
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                cd $PROJECT_DIR
                npm run build
                '''
            }
        }

        stage('Reload Nginx') {
            steps {
                sh 'sudo systemctl reload nginx'
            }
        }
    }
}
