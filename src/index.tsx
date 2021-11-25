import * as esbuild from 'esbuild-wasm'
import ReactDOM from 'react-dom'

import {useState, useEffect, useRef} from 'react'
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'
import { fetchPlugin } from './plugins/fetch-plugin'


const App = () => {
    
    const ref = useRef<any>()
    const iFrameRef = useRef<any>()
    const [input, setInput] = useState('')
    

    const startService = async () => {
        ref.current = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
        })

        
    }

    useEffect(() => {
        startService()
    },[])
    
    const onClick = async () =>  {
        if (!ref.current) {
            return;
        }

        iFrameRef.current.srcdoc = html;

        const result = await ref.current.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin(), fetchPlugin(input)],
            define: {
                'process.env.NODE_ENV' : '"production"',
                global: 'window'
            }
        })

        
        //setCode(result.outputFiles[0].text)
        iFrameRef.current.contentWindow.postMessage(result.outputFiles[0].text, '*')
    }

    const html = `
       
        <html>
            <head></head>
            <body>
                <div id="root"> </div>
                <script>
                    window.addEventListener('message', (event) => {
                        try {
                            eval(event.data);
                        } catch (err) {
                            const root = document.querySelector('#root')
                            root.innerHTML = '<div style="color: red"> <h4>Runtime Error</h4>' + err + '</div>'
                        }
                    }, false)
                </script>
            </body>
        </html>

    `;

    return (
        <div>
            <textarea value={input}onChange={e => setInput(e.target.value)} style={{height:100, width:300}}> </textarea>
            <div>
                <button onClick={onClick}>submit</button>
            </div>
            
            <iframe title='iFrame' ref={iFrameRef} sandbox="allow-scripts" srcDoc={html}/>
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector('#root'))