import os
import json
import pymongo
from bs4 import BeautifulSoup
from hashlib import sha256
from bson import json_util
from flask import Flask, Response, request, jsonify
from flask_cors import CORS, cross_origin

from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.document_loaders import TextLoader

from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.chains.question_answering import load_qa_chain
app = Flask(__name__) 

f = open('jon.json')
data = json.load(f)
os.environ["OPENAI_API_KEY"] = data["OPENAI_API_KEY"]
OPENAI_API_KEY = data["OPENAI_API_KEY"]

myclient = pymongo.MongoClient("mongodb://172.17.0.3:27017/")
# mydb = myclient[user]
mydb = myclient["data"]
dataCol = mydb["data"]

CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/upload", methods=['POST'])
def upload():
    req = json.loads(request.data.decode("utf-8"))
    
    soup = BeautifulSoup(req['data'], 'html.parser')
    text = soup.get_text()
    formatted_text = '\n\n'.join([para.strip() for para in text.split('\n') if para.strip()])

    with open("example.txt", "w") as file:
        file.write(formatted_text)
    
    return "ok"


def parse_json(data):
    return json.loads(json_util.dumps(data))


from langchain.document_loaders import UnstructuredFileLoader
@app.route("/check", methods=['POST'])
def check():
    req = json.loads(request.data.decode("utf-8"))
    hash = req['hash']
    
    if os.path.exists('vectorData/'):
        pass
    else:
        os.mkdir('vectorData/')
    
    if 'data' in req:
        soup = BeautifulSoup(req['data'], 'html.parser')
        text = soup.get_text()
        formatted_text = '\n\n'.join([para.strip() for para in text.split('\n') if para.strip()])

        checkExist = []
        for i in parse_json(dataCol.find({'hash': hash})):
            checkExist.append(i)
        
        if len(checkExist) == 0:
            
            if os.path.exists('vectorData/'):
                if os.path.exists('./vectorData/' + hash):
                    pass
                else:
                    os.mkdir('./vectorData/' + hash)
            else:
                os.mkdir('./vectorData/')
            
            f = open("./vectorData/" + hash + "/" + hash + ".txt", "a")
            f.write(formatted_text)
            f.close()
            
            loader = UnstructuredFileLoader("./vectorData/" + hash + "/" + hash + ".txt")
            documents = loader.load()

            text_splitter = CharacterTextSplitter(chunk_size=200, chunk_overlap=10)
            docs = text_splitter.split_documents(documents)

            if len(docs) > 3:
                for i in docs:
                    i.metadata = {"source": req['url']}

                embedding = OpenAIEmbeddings()
                db = Chroma.from_documents(documents=docs, embedding=embedding, persist_directory='./vectorData/' + hash)
                db.from_documents(documents=docs)
                db.persist()

                dataCol.insert_one({'hash': hash, 'data': formatted_text, 'url': req['url'], 'messages': []})
                return {"response": "ok", "data": {'hash': hash, 'data': formatted_text, 'url': req['url'], 'messages': []}}

            dataCol.insert_one({'hash': 'documentNotBigEnough', 'data': formatted_text, 'url': req['url'], 'messages': []})
            return {"response": "ok", "data": {'hash': 'documentNotBigEnough', 'data': formatted_text, 'url': req['url'], 'messages': []}}

        return {"response": "ok", "data": parse_json(dataCol.find({'hash': hash}))}


        
    elif 'hash' in req:
        checkExist = []
        for i in parse_json(dataCol.find({'hash': hash})):
            checkExist.append(i)
            
        if len(checkExist) == 0:
            return {"response": "hashNotFound"}
        else:
            return {"response": "ok", "data": checkExist[0]}
            




@app.route("/newMessage", methods=['POST'])
def newMessage():
    req = json.loads(request.data.decode("utf-8"))
    hash = req['hash']
    
    tempArr = []
    for q in parse_json(dataCol.find_one({'hash': hash})['messages']):
        tempArr.append(q)
    tempArr.append([req['message']])
    
    dataCol.update_one({'hash': hash},{"$set":{"messages": tempArr}})
    
    return {"response": "ok", "data": parse_json(dataCol.find({'hash': hash}))}



@app.route("/response", methods=['POST'])
def response():
    req = json.loads(request.data.decode("utf-8"))
    hash = req['hash']

    def llm(param):
        embedding = OpenAIEmbeddings()
        db = Chroma(persist_directory='vectorData/' + hash, embedding_function=embedding)
        
        llm = OpenAI(temperature=0, openai_api_key=OPENAI_API_KEY)
        chain = load_qa_chain(llm, chain_type="stuff")
        
        query = param[0]
        docs = db.similarity_search(query)
        response = chain.run(input_documents=docs, question=query)
        
        param.append(response)
        return param
    
    tempArr = []
    for q in parse_json(dataCol.find_one({'hash': hash})['messages']):
        valueArr = q
        if len(q) == 1:
            valueArr = llm(q)
        
        tempArr.append(valueArr)
    
    dataCol.update_one({'hash': hash},{"$set":{"messages": tempArr}})
    return {"response": "ok", "data": parse_json(dataCol.find_one({'hash': hash}))}



@app.route("/data", methods=['POST'])
def data():
    req = json.loads(request.data.decode("utf-8"))
    
    hash = req['hash']
    
    return {"response": "ok", "data": parse_json(dataCol.find({'hash': hash}))}

@app.route("/")
def test0():
    print('req')
    return "ok"


if __name__ == '__main__':
    app.run(host='localhost', port='3001', debug=True)