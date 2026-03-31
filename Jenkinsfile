pipeline {
    agent any

    environment {
        PROJECT_DIR = "/var/www/jenkins/sp-frontend"
    }

    stages {
        stage('Clean') {
            steps {
                sh 'rm -rf $PROJECT_DIR/*'
            }
        }

        stage('Clone') {
            steps {
                sh '''
                git clone https://github.com/codewithkathir/sp-frontend.git $PROJECT_DIR
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

        stage('Restart Nginx') {
            steps {
                sh 'sudo systemctl reload nginx'
            }
        }
    }
}
