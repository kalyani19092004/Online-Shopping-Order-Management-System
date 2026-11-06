pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm.cmd install'
            }
        }

        stage('Application Validation') {
            steps {
                bat 'node --check server.js'
                bat 'node --check database.js'
                bat 'node --check public/script.js'
            }
        }
    }

    post {
        success {
            echo 'Online Shopping application pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}
