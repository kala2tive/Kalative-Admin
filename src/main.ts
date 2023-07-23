import axios from "axios";
import Toastify from 'toastify-js';

const HOST = 'https://calm-blue-trout-tutu.cyclic.app';

const postForm = document.querySelector('#postForm') as HTMLFormElement;
const postTypes: HTMLInputElement[] = Array.from(document.querySelectorAll('input[type="radio"]'));

const postTitle = <HTMLInputElement>document.querySelector('#title');
const postWriter = <HTMLInputElement>document.querySelector('#writer');
const postDescription = <HTMLTextAreaElement>document.querySelector('#description');
const postImage = <HTMLInputElement>document.querySelector('#image');

const submitBtn = <HTMLButtonElement>document.querySelector('#submitBtn');

const myToast = (message: string, color: string) => {
  return Toastify({
    text : message,
    duration : 4000,
    position : 'right',
    style : {
      background : color,
      color : '#fff',
      padding : '0.7rem 1rem',
      cursor : 'default',
    }
  });
}

interface PostType {
  type: string,
  title: string,
  writer: string,
  description: string,
  image: File | ''
}

let postObject: PostType = {
  type : '',
  title : '',
  writer : '',
  description : '',
  image : ''
}

const sendArticleToDatabase = async (postData: PostType) => {
  
  let sendTo: string;
  sendTo = postData.type === 'blogs' ? 'addBlog' : 'addNews';
  
  try {

    const { data } = await axios.post(`${HOST}/api/${postData.type}/${sendTo}`, postData, {
      headers : {
        'Content-Type' : 'multipart/form-data'
      }
    });

    myToast(data.message, '#19795F').showToast();

    submitBtn.removeAttribute('aria-busy');

    postTypes.forEach((radio: HTMLInputElement) => {
      radio.checked = false;
    })
    postTitle.value = '';
    postWriter.value = 'Kalative';
    postDescription.value = '';
    postImage.value = '';

  } catch (error) {
    
    myToast('Error Sending Data', '#DC3545').showToast();

  }
}

const submitForm = async (e: Event): Promise<void> => {
  e.preventDefault();
  submitBtn.ariaBusy = "true";
  postTypes.forEach((radio: HTMLInputElement) => {
    if (radio.checked) {
      postObject = {...postObject, type: radio.value}
    }
  })

  if (postTitle && postWriter && postDescription) {
    postObject = {
      ...postObject,
      title : postTitle.value,
      writer : postWriter.value,
      description : postDescription.value
    }
  }

  if (postImage.files) {
    const ImageSelected: File = postImage.files[0];
    postObject = {
      ...postObject,
      image: ImageSelected
    };
  }

  await sendArticleToDatabase(postObject);

}

postForm.addEventListener('submit', submitForm);

const allUsersBox = <HTMLUListElement>document.querySelector('#allUsers');

interface UserType {
  name: string,
  mobile: string,
  email: string
}

let myUsers: UserType[];

const updateUsers = (data: UserType[]) => {
  allUsersBox.innerHTML = '';

  if (data.length === 0) {
    allUsersBox.innerHTML = 'Empty Data!';
  }
  else {
    data.forEach((userItem: UserType) => {
      let singleItem = document.createElement('li');
      singleItem.classList.add('userItem');
      
      let name = document.createElement('p');
      name.textContent = 'Name :- ' + userItem.name;
      let email = document.createElement('p');
      email.textContent = 'Email :- ' + userItem.email;
      let mobile = document.createElement('p');
      mobile.textContent = 'Mobile :- ' + userItem.mobile;
      
      singleItem.append(name, email, mobile);
      allUsersBox.append(singleItem);
    })
  }

}

const getAllUsersFromDB = async (): Promise<void> => {
  allUsersBox.innerHTML = 'Loading';
  const { data } = await axios.get(`${HOST}/api/details`);
  myUsers = data.Users;
  updateUsers(myUsers);
}



getAllUsersFromDB();