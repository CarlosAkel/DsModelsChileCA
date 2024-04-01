from flask import Flask, render_template, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import os
import zipfile
import shutil
app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        files = request.files.getlist('file')

        if len(files) == 0:
            return 'No files uploaded', 400
        
        try:
            output_dir = '/tmp/output_dir'
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir)
            if os.path.exists('/tmp/extract'):
                shutil.rmtree('/tmp/extract')
            for file in files:
                # Read the file content directly from file.stream
                file_contents = file.stream.read()

                # Create a temporary file path
                temp_file_path = '/tmp/temp_file.nds'  # Adjust as needed for your system

                # Write the file content to the temporary file
                with open(temp_file_path, 'wb') as temp_file:
                    temp_file.write(file_contents)

                # Run the apicula command with the temporary file path
                subprocess.check_output(['apicula/target/release/apicula', 'extract', temp_file_path, '-o', '/tmp/extract', '--overwrite'], stderr=subprocess.STDOUT)
                subprocess.check_output(['apicula/target/release/apicula', 'convert', '/tmp/extract', '-o', '/tmp/output_dir', '-f=glb', '--overwrite'], stderr=subprocess.STDOUT)

                # Remove the temporary file
                os.remove(temp_file_path)
            
            # Create a zip archive containing all files in the output directory
            zip_filename = '/tmp/output_files.zip'
            with zipfile.ZipFile(zip_filename, 'w') as zip_file:
                for root, dirs, files in os.walk(output_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zip_file.write(file_path, os.path.relpath(file_path, output_dir))

            # Send the zip file as a response for the user to download
            return send_from_directory(directory='/tmp/', path='output_files.zip', as_attachment=True)
            #return send_file(zip_filename, as_attachment=True, download_name='output_files.zip')
        except subprocess.CalledProcessError as e:
            return f"Error: {e.output.decode('utf-8')}", 500

    return render_template('index.html')

@app.route('/show', methods=['GET'])
def show():
    return render_template('ShowModel.html')
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)