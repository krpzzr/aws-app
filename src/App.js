import React, { Component } from 'react';
import AWS from 'aws-sdk';
import Dropzone from 'react-dropzone';

import './App.css';
import cloudUploadImage from './cloud-upload.png';

class App extends Component {

    state = {
        accessKeyID: '',
        secretAccessKey: '',
        bucketName: '',
        files: [],
        isUploading: false
    };

    onDrop = files => this.setState({files});

    componentDidMount() {
        fetch('configuration.json')
            .then(res => res.json())
            .then(data => {
                const { accessKeyID, secretAccessKey, bucketName } = data;

                this.setState({
                    accessKeyID,
                    secretAccessKey,
                    bucketName
                });
            }).catch(err => console.error(err))
    }


    uploadToS3 = () => {
        const { accessKeyID, secretAccessKey, bucketName } = this.state;
        const file = this.state.files[0];
        const s3bucket = new AWS.S3({
            accessKeyId: accessKeyID,
            secretAccessKey: secretAccessKey
        });

        this.setState({isUploading: true});
        let self = this;

        s3bucket.createBucket(function () {
            var params = {
                Bucket: bucketName,
                Key: file.name,
                Body: file
            };
            s3bucket.upload(params, function (err) {
                self.setState({
                    isUploading: false,
                    files: []
                });

                if (err) {
                    alert('Oops, something is wrong');
                    console.error(err)
                } else {
                    alert(`Your file ${file.name} was sent`)
                }

            });
        });
    };

  render() {
      const files = this.state.files.map(file => (
          <li key={file.name}>
              {file.name}
          </li>
      ));


      return (
      <div className="App">
          <Dropzone onDrop={this.onDrop}>
              {({getRootProps, getInputProps}) => (
                  <section>
                        <div {...getRootProps()} className='dropzone_wrapper'>
                            <div className='circle'>
                                <img className='upload_image' src={cloudUploadImage} alt="img" />
                                <b>Drag 'n' drop to upload an audio track</b>
                            </div>

                            <input {...getInputProps()}/>

                            <br/>
                            <button className='upload_button'>Upload audio track</button>
                        </div>

                       {
                           this.state.files.length > 0 &&
                           <div>
                               <ul className='files_list'>
                                   {files}
                               </ul>
                               <button disabled={this.state.isUploading} className='send_button' onClick={this.uploadToS3}>{
                                   this.state.isUploading ? 'Please wait...' : 'Send'}
                               </button>
                           </div>
                       }
                  </section>
              )}
          </Dropzone>
      </div>
    );
  }
}

export default App;
