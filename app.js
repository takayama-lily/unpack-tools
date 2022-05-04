/**
 * unpack-tools (c) 2022, takayama lily
 * licensed under the GNU Affero General Public License v3.0
 * @see https://github.com/takayama-lily/unpack-tools/blob/main/LICENSE
 */
const $ = document.querySelector.bind(document)
const Buffer = buffer.Buffer

$("#new-tab").href = location.href

function contentChangeListener () {
	this.value = prettifyHex(this.value)
	const cnt = String(this.value).replace(/\s/g, "").length / 2
	$("#bytes-cnt").innerHTML = String(Math.floor(cnt))
}
$("#content").onkeyup = contentChangeListener
$("#content").onmouseup = contentChangeListener
$("#content").onchange = contentChangeListener

function keyChangeListener () {
	this.value = prettifyHex(this.value)
}
$("#key").onkeyup = keyChangeListener
$("#key").onmouseup = keyChangeListener
$("#key").onchange = keyChangeListener

function pbReplacer(k, v) {
	if (k !== "" && v instanceof pb.Proto) {
		v.__proto__.encoded = v.encoded
		return v.__proto__
	}
	if (k === "encoded")
		return prettifyHex(Buffer.from(v).toString("hex")) + ("(" + Buffer.from(v).toString() + ")")
	return v
}

$("#do").onclick = function () {
	const type = $("#type").value
	const content = $("#content").value.replace(/\s/g, "")
	const key = $("#key").value.replace(/\s/g, "")
	const contentBuffer = Buffer.from(content, "hex")
	const keyBuffer = Buffer.from(key, "hex")
	let resultBuffer, result
	try {
		switch (type) {
		case "UnProtobuf":
			resultBuffer = pb.decode(contentBuffer)
			delete resultBuffer.encoded
			result = JSON.stringify(resultBuffer, pbReplacer, 2).replace(/\n/g, "<br>")
			break
		case "UnQQTea":
			resultBuffer = tea.decrypt(contentBuffer, keyBuffer)
			result = prettifyHex(resultBuffer.toString("hex"))
			break
		case "EnQQTea":
			resultBuffer = tea.encrypt(contentBuffer, keyBuffer)
			result = prettifyHex(resultBuffer.toString("hex"))
			break
		default:
			result = `<span style="color:red">Error: unimplemented</span>`
			break
		}
	} catch (e) {
		result = `<span style="color:red">Error: ${e.message}</span>`
	}
	$("#result").innerHTML = String(result)
}

function prettifyHex(hex) {
	return hex.replace(/\s/g, "").replace(/(.)(.)/g, '$1$2 ')
}

// {
// 	while (bytes.length < 4)
// 		bytes.unshift(0)
// 	const dv = new DataView(new Uint8Array(bytes).buffer)
// 	result = dv.getUint32()
// }