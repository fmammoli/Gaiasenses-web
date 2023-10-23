
        
const i32 = (v) => v
const f32 = i32
const f64 = i32
const toInt = (v) => v
const toFloat = (v) => v
const createFloatArray = (length) => 
    new Float64Array(length)
const setFloatDataView = (d, p, v) => d.setFloat64(p, v)
const getFloatDataView = (d, p) => d.getFloat64(p)
const FS_OPERATION_SUCCESS = 0
const FS_OPERATION_FAILURE = 1
/*
 * Copyright (c) 2012-2020 Sébastien Piquemal <sebpiq@gmail.com>
 *
 * BSD Simplified License.
 * For information on usage and redistribution, and for a DISCLAIMER OF ALL
 * WARRANTIES, see the file, "LICENSE.txt," in this distribution.
 *
 * See https://github.com/sebpiq/WebPd_pd-parser for documentation
 *
 */
// =========================== BUF API
/**
 * Ring buffer
 */
class buf_SoundBuffer {
    constructor(length) {
        this.length = length;
        this.data = createFloatArray(length);
        this.writeCursor = 0;
        this.pullAvailableLength = 0;
    }
}
/** Erases all the content from the buffer */
function buf_create(length) {
    return new buf_SoundBuffer(length);
}
/** Erases all the content from the buffer */
function buf_clear(buffer) {
    buffer.data.fill(0);
}
/**
 * Pushes a block to the buffer, throwing an error if the buffer is full.
 * If the block is written successfully, {@link buf_SoundBuffer#writeCursor}
 * is moved corresponding with the length of data written.
 *
 * @todo : Optimize by allowing to read/write directly from host
 */
function buf_pushBlock(buffer, block) {
    if (buffer.pullAvailableLength + block.length > buffer.length) {
        throw new Error('buffer full');
    }
    let left = block.length;
    while (left > 0) {
        const lengthToWrite = toInt(Math.min(toFloat(buffer.length - buffer.writeCursor), toFloat(left)));
        buffer.data.set(block.subarray(block.length - left, block.length - left + lengthToWrite), buffer.writeCursor);
        left -= lengthToWrite;
        buffer.writeCursor = (buffer.writeCursor + lengthToWrite) % buffer.length;
        buffer.pullAvailableLength += lengthToWrite;
    }
    return buffer.pullAvailableLength;
}
/**
 * Pulls a single sample from the buffer.
 * This is a destructive operation, and the sample will be
 * unavailable for subsequent readers with the same operation.
 */
function buf_pullSample(buffer) {
    if (buffer.pullAvailableLength <= 0) {
        return 0;
    }
    const readCursor = buffer.writeCursor - buffer.pullAvailableLength;
    buffer.pullAvailableLength -= 1;
    return buffer.data[readCursor >= 0 ? readCursor : buffer.length + readCursor];
}
/**
 * Writes a sample at `@link writeCursor` and increments `writeCursor` by one.
 */
function buf_writeSample(buffer, value) {
    buffer.data[buffer.writeCursor] = value;
    buffer.writeCursor = (buffer.writeCursor + 1) % buffer.length;
}
/**
 * Reads the sample at position `writeCursor - offset`.
 * @param offset Must be between 0 (for reading the last written sample)
 *  and {@link buf_SoundBuffer#length} - 1. A value outside these bounds will not cause
 *  an error, but might cause unexpected results.
 */
function buf_readSample(buffer, offset) {
    // R = (buffer.writeCursor - 1 - offset) -> ideal read position
    // W = R % buffer.length -> wrap it so that its within buffer length bounds (but could be negative)
    // (W + buffer.length) % buffer.length -> if W negative, (W + buffer.length) shifts it back to positive.
    return buffer.data[(buffer.length + ((buffer.writeCursor - 1 - offset) % buffer.length)) % buffer.length];
}
/*
 * Copyright (c) 2012-2020 Sébastien Piquemal <sebpiq@gmail.com>
 *
 * BSD Simplified License.
 * For information on usage and redistribution, and for a DISCLAIMER OF ALL
 * WARRANTIES, see the file, "LICENSE.txt," in this distribution.
 *
 * See https://github.com/sebpiq/WebPd_pd-parser for documentation
 *
 */
/**
 * Skeduler id that will never be used.
 * Can be used as a "no id", or "null" value.
 */
const SKED_ID_NULL = -1;
const SKED_ID_COUNTER_INIT = 1;
const _SKED_WAIT_IN_PROGRESS = 0;
const _SKED_WAIT_OVER = 1;
const _SKED_MODE_WAIT = 0;
const _SKED_MODE_SUBSCRIBE = 1;
// =========================== SKED API
class SkedRequest {
}
class Skeduler {
}
/** Creates a new Skeduler. */
function sked_create(isLoggingEvents) {
    return {
        eventLog: new Set(),
        requests: new Map(),
        callbacks: new Map(),
        idCounter: SKED_ID_COUNTER_INIT,
        isLoggingEvents,
    };
}
/**
 * Asks the skeduler to wait for an event to occur and trigger a callback.
 * If the event has already occurred, the callback is triggered instantly
 * when calling the function.
 * Once triggered, the callback is forgotten.
 * @returns an id allowing to cancel the callback with {@link sked_cancel}
 */
function sked_wait(skeduler, event, callback) {
    if (skeduler.isLoggingEvents === false) {
        throw new Error("Please activate skeduler's isLoggingEvents");
    }
    if (skeduler.eventLog.has(event)) {
        callback(event);
        return SKED_ID_NULL;
    }
    else {
        return _sked_createRequest(skeduler, event, callback, _SKED_MODE_WAIT);
    }
}
/**
 * Asks the skeduler to wait for an event to occur and trigger a callback.
 * If the event has already occurred, the callback is NOT triggered.
 * Once triggered, the callback is forgotten.
 * @returns an id allowing to cancel the callback with {@link sked_cancel}
 */
function sked_wait_future(skeduler, event, callback) {
    return _sked_createRequest(skeduler, event, callback, _SKED_MODE_WAIT);
}
/**
 * Asks the skeduler to trigger a callback everytime an event occurs
 * @returns an id allowing to cancel the callback with {@link sked_cancel}
 */
function sked_subscribe(skeduler, event, callback) {
    return _sked_createRequest(skeduler, event, callback, _SKED_MODE_SUBSCRIBE);
}
/** Notifies the skeduler that an event has just occurred. */
function sked_emit(skeduler, event) {
    if (skeduler.isLoggingEvents === true) {
        skeduler.eventLog.add(event);
    }
    if (skeduler.requests.has(event)) {
        const requests = skeduler.requests.get(event);
        const requestsStaying = [];
        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            if (skeduler.callbacks.has(request.id)) {
                skeduler.callbacks.get(request.id)(event);
                if (request.mode === _SKED_MODE_WAIT) {
                    skeduler.callbacks.delete(request.id);
                }
                else {
                    requestsStaying.push(request);
                }
            }
        }
        skeduler.requests.set(event, requestsStaying);
    }
}
/** Cancels a callback */
function sked_cancel(skeduler, id) {
    skeduler.callbacks.delete(id);
}
// =========================== PRIVATE
function _sked_createRequest(skeduler, event, callback, mode) {
    const id = _sked_nextId(skeduler);
    const request = { id, mode };
    skeduler.callbacks.set(id, callback);
    if (!skeduler.requests.has(event)) {
        skeduler.requests.set(event, [request]);
    }
    else {
        skeduler.requests.get(event).push(request);
    }
    return id;
}
function _sked_nextId(skeduler) {
    return skeduler.idCounter++;
}
/*
 * Copyright (c) 2012-2020 Sébastien Piquemal <sebpiq@gmail.com>
 *
 * BSD Simplified License.
 * For information on usage and redistribution, and for a DISCLAIMER OF ALL
 * WARRANTIES, see the file, "LICENSE.txt," in this distribution.
 *
 * See https://github.com/sebpiq/WebPd_pd-parser for documentation
 *
 */
const _commons_ARRAYS = new Map();
const _commons_ARRAYS_SKEDULER = sked_create(false);
const _commons_ENGINE_LOGGED_SKEDULER = sked_create(true);
const _commons_FRAME_SKEDULER = sked_create(false);
// =========================== COMMONS API
/**
 * @param callback Called when the engine is configured, or immediately if the engine
 * was already configured.
 */
function commons_waitEngineConfigure(callback) {
    sked_wait(_commons_ENGINE_LOGGED_SKEDULER, 'configure', callback);
}
/**
 * Schedules a callback to be called at the given frame.
 * If the frame already occurred, or is the current frame, the callback won't be executed.
 */
function commons_waitFrame(frame, callback) {
    return sked_wait_future(_commons_FRAME_SKEDULER, frame.toString(), callback);
}
/**
 * Cancels waiting for a frame to occur.
 */
function commons_cancelWaitFrame(id) {
    sked_cancel(_commons_FRAME_SKEDULER, id);
}
/**
 * @param callback Called immediately if the array exists, and subsequently, everytime
 * the array is set again.
 * @returns An id that can be used to cancel the subscription.
 */
function commons_subscribeArrayChanges(arrayName, callback) {
    const id = sked_subscribe(_commons_ARRAYS_SKEDULER, arrayName, callback);
    if (_commons_ARRAYS.has(arrayName)) {
        callback(arrayName);
    }
    return id;
}
/**
 * @param id The id received when subscribing.
 */
function commons_cancelArrayChangesSubscription(id) {
    sked_cancel(_commons_ARRAYS_SKEDULER, id);
}
/** Gets an named array, throwing an error if the array doesn't exist. */
function commons_getArray(arrayName) {
    if (!_commons_ARRAYS.has(arrayName)) {
        throw new Error('Unknown array ' + arrayName);
    }
    return _commons_ARRAYS.get(arrayName);
}
function commons_hasArray(arrayName) {
    return _commons_ARRAYS.has(arrayName);
}
function commons_setArray(arrayName, array) {
    _commons_ARRAYS.set(arrayName, array);
    sked_emit(_commons_ARRAYS_SKEDULER, arrayName);
}
// =========================== PRIVATE API
function _commons_emitEngineConfigure() {
    sked_emit(_commons_ENGINE_LOGGED_SKEDULER, 'configure');
}
function _commons_emitFrame(frame) {
    sked_emit(_commons_FRAME_SKEDULER, frame.toString());
}

const MSG_FLOAT_TOKEN = "number"
const MSG_STRING_TOKEN = "string"
const msg_create = () => []
const msg_getLength = (m) => m.length
const msg_getTokenType = (m, i) => typeof m[i]
const msg_isStringToken = (m, i) => msg_getTokenType(m, i) === 'string'
const msg_isFloatToken = (m, i) => msg_getTokenType(m, i) === 'number'
const msg_isMatching = (m, tokenTypes) => {
    return (m.length === tokenTypes.length) 
        && m.every((v, i) => msg_getTokenType(m, i) === tokenTypes[i])
}
const msg_writeFloatToken = ( m, i, v ) => m[i] = v
const msg_writeStringToken = msg_writeFloatToken
const msg_readFloatToken = ( m, i ) => m[i]
const msg_readStringToken = msg_readFloatToken
const msg_floats = (v) => v
const msg_strings = (v) => v
const msg_display = (m) => '[' + m
    .map(t => typeof t === 'string' ? '"' + t + '"' : t.toString())
    .join(', ') + ']'
/*
 * Copyright (c) 2012-2020 Sébastien Piquemal <sebpiq@gmail.com>
 *
 * BSD Simplified License.
 * For information on usage and redistribution, and for a DISCLAIMER OF ALL
 * WARRANTIES, see the file, "LICENSE.txt," in this distribution.
 *
 * See https://github.com/sebpiq/WebPd_pd-parser for documentation
 *
 */
const _FS_OPERATIONS_IDS = new Set();
const _FS_OPERATIONS_CALLBACKS = new Map();
const _FS_OPERATIONS_SOUND_CALLBACKS = new Map();
const _FS_SOUND_STREAM_BUFFERS = new Map();
// We start at 1, because 0 is what ASC uses when host forgets to pass an arg to 
// a function. Therefore we can get false negatives when a test happens to expect a 0.
let _FS_OPERATION_COUNTER = 1;
const _FS_SOUND_BUFFER_LENGTH = 20 * 44100;
// =========================== EXPORTED API
function x_fs_onReadSoundFileResponse(id, status, sound) {
    _fs_assertOperationExists(id, 'x_fs_onReadSoundFileResponse');
    _FS_OPERATIONS_IDS.delete(id);
    // Finish cleaning before calling the callback in case it would throw an error.
    const callback = _FS_OPERATIONS_SOUND_CALLBACKS.get(id);
    callback(id, status, sound);
    _FS_OPERATIONS_SOUND_CALLBACKS.delete(id);
}
function x_fs_onWriteSoundFileResponse(id, status) {
    _fs_assertOperationExists(id, 'x_fs_onWriteSoundFileResponse');
    _FS_OPERATIONS_IDS.delete(id);
    // Finish cleaning before calling the callback in case it would throw an error.
    const callback = _FS_OPERATIONS_CALLBACKS.get(id);
    callback(id, status);
    _FS_OPERATIONS_CALLBACKS.delete(id);
}
function x_fs_onSoundStreamData(id, block) {
    _fs_assertOperationExists(id, 'x_fs_onSoundStreamData');
    const buffers = _FS_SOUND_STREAM_BUFFERS.get(id);
    for (let i = 0; i < buffers.length; i++) {
        buf_pushBlock(buffers[i], block[i]);
    }
    return buffers[0].pullAvailableLength;
}
function x_fs_onCloseSoundStream(id, status) {
    fs_closeSoundStream(id, status);
}
// =========================== FS API
class fs_SoundInfo {
}
function fs_readSoundFile(url, soundInfo, callback) {
    const id = _fs_createOperationId();
    _FS_OPERATIONS_SOUND_CALLBACKS.set(id, callback);
    i_fs_readSoundFile(id, url, fs_soundInfoToMessage(soundInfo));
    return id;
}
function fs_writeSoundFile(sound, url, soundInfo, callback) {
    const id = _fs_createOperationId();
    _FS_OPERATIONS_CALLBACKS.set(id, callback);
    i_fs_writeSoundFile(id, sound, url, fs_soundInfoToMessage(soundInfo));
    return id;
}
function fs_openSoundReadStream(url, soundInfo, callback) {
    const id = _fs_createOperationId();
    const buffers = [];
    for (let channel = 0; channel < soundInfo.channelCount; channel++) {
        buffers.push(new buf_SoundBuffer(_FS_SOUND_BUFFER_LENGTH));
    }
    _FS_SOUND_STREAM_BUFFERS.set(id, buffers);
    _FS_OPERATIONS_CALLBACKS.set(id, callback);
    i_fs_openSoundReadStream(id, url, fs_soundInfoToMessage(soundInfo));
    return id;
}
function fs_openSoundWriteStream(url, soundInfo, callback) {
    const id = _fs_createOperationId();
    _FS_SOUND_STREAM_BUFFERS.set(id, []);
    _FS_OPERATIONS_CALLBACKS.set(id, callback);
    i_fs_openSoundWriteStream(id, url, fs_soundInfoToMessage(soundInfo));
    return id;
}
function fs_sendSoundStreamData(id, block) {
    _fs_assertOperationExists(id, 'fs_sendSoundStreamData');
    i_fs_sendSoundStreamData(id, block);
}
function fs_closeSoundStream(id, status) {
    if (!_FS_OPERATIONS_IDS.has(id)) {
        return;
    }
    _FS_OPERATIONS_IDS.delete(id);
    _FS_OPERATIONS_CALLBACKS.get(id)(id, status);
    _FS_OPERATIONS_CALLBACKS.delete(id);
    // Delete this last, to give the callback 
    // a chance to save a reference to the buffer
    // If write stream, there won't be a buffer
    if (_FS_SOUND_STREAM_BUFFERS.has(id)) {
        _FS_SOUND_STREAM_BUFFERS.delete(id);
    }
    i_fs_closeSoundStream(id, status);
}
function fs_soundInfoToMessage(soundInfo) {
    const info = msg_create([
        MSG_FLOAT_TOKEN,
        MSG_FLOAT_TOKEN,
        MSG_FLOAT_TOKEN,
        MSG_STRING_TOKEN,
        soundInfo.encodingFormat.length,
        MSG_STRING_TOKEN,
        soundInfo.endianness.length,
        MSG_STRING_TOKEN,
        soundInfo.extraOptions.length
    ]);
    msg_writeFloatToken(info, 0, toFloat(soundInfo.channelCount));
    msg_writeFloatToken(info, 1, toFloat(soundInfo.sampleRate));
    msg_writeFloatToken(info, 2, toFloat(soundInfo.bitDepth));
    msg_writeStringToken(info, 3, soundInfo.encodingFormat);
    msg_writeStringToken(info, 4, soundInfo.endianness);
    msg_writeStringToken(info, 5, soundInfo.extraOptions);
    return info;
}
// =========================== PRIVATE
function _fs_createOperationId() {
    const id = _FS_OPERATION_COUNTER++;
    _FS_OPERATIONS_IDS.add(id);
    return id;
}
function _fs_assertOperationExists(id, operationName) {
    if (!_FS_OPERATIONS_IDS.has(id)) {
        throw new Error(operationName + ' operation unknown : ' + id.toString());
    }
}


        
    


        
        let F = 0
        let FRAME = 0
        let BLOCK_SIZE = 0
        let SAMPLE_RATE = 0
        function SND_TO_NULL (m) {}


        
    function msg_isBang (message) {
        return (
            msg_isStringToken(message, 0) 
            && msg_readStringToken(message, 0) === 'bang'
        )
    }

    function msg_bang () {
        const message = msg_create([MSG_STRING_TOKEN, 4])
        msg_writeStringToken(message, 0, 'bang')
        return message
    }

    function msg_emptyToBang (message) {
        if (msg_getLength(message) === 0) {
            return msg_bang()
        } else {
            return message
        }
    }


    const MSG_BUSES = new Map()

    function msgBusPublish (busName, message) {
        let i = 0
        const callbacks = MSG_BUSES.has(busName) ? MSG_BUSES.get(busName): []
        for (i = 0; i < callbacks.length; i++) {
            callbacks[i](message)
        }
    }

    function msgBusSubscribe (busName, callback) {
        if (!MSG_BUSES.has(busName)) {
            MSG_BUSES.set(busName, [])
        }
        MSG_BUSES.get(busName).push(callback)
    }

    function msgBusUnsubscribe (busName, callback) {
        if (!MSG_BUSES.has(busName)) {
            return
        }
        const callbacks = MSG_BUSES.get(busName)
        const found = callbacks.indexOf(callback) !== -1
        if (found !== -1) {
            callbacks.splice(found, 1)
        }
    }


    function computeUnitInSamples (sampleRate, amount, unit) {
        if (unit === 'msec' || unit === 'millisecond') {
            return amount / 1000 * sampleRate
        } else if (unit === 'sec' || unit === 'seconds' || unit === 'second') {
            return amount * sampleRate
        } else if (unit === 'min' || unit === 'minutes' || unit === 'minute') {
            return amount * 60 * sampleRate
        } else if (unit === 'samp' || unit === 'samples' || unit === 'sample') {
            return amount
        } else {
            throw new Error("invalid time unit : " + unit)
        }
    }


    function msg_isAction (message, action) {
        return msg_isMatching(message, [MSG_STRING_TOKEN])
            && msg_readStringToken(message, 0) === action
    }



    function msg_copyTemplate (src, start, end) {
        const template = []
        for (let i = start; i < end; i++) {
            const tokenType = msg_getTokenType(src, i)
            template.push(tokenType)
            if (tokenType === MSG_STRING_TOKEN) {
                template.push(msg_readStringToken(src, i).length)
            }
        }
        return template
    }

    function msg_copyMessage (src, dest, srcStart, srcEnd, destStart) {
        let i = srcStart
        let j = destStart
        for (i, j; i < srcEnd; i++, j++) {
            if (msg_getTokenType(src, i) === MSG_STRING_TOKEN) {
                msg_writeStringToken(dest, j, msg_readStringToken(src, i))
            } else {
                msg_writeFloatToken(dest, j, msg_readFloatToken(src, i))
            }
        }
    }

    function msg_slice (message, start, end) {
        if (msg_getLength(message) <= start) {
            throw new Error('message empty')
        }
        const template = msg_copyTemplate(message, start, end)
        const newMessage = msg_create(template)
        msg_copyMessage(message, newMessage, start, end, 0)
        return newMessage
    }

    function msg_concat  (message1, message2) {
        const newMessage = msg_create(
            msg_copyTemplate(message1, 0, msg_getLength(message1))
                .concat(msg_copyTemplate(message2, 0, msg_getLength(message2))))
        msg_copyMessage(message1, newMessage, 0, msg_getLength(message1), 0)
        msg_copyMessage(message2, newMessage, 0, msg_getLength(message2), msg_getLength(message1))
        return newMessage
    }

    function msg_shift (message) {
        switch (msg_getLength(message)) {
            case 0:
                throw new Error('message empty')
            case 1:
                return msg_create([])
            default:
                return msg_slice(message, 1, msg_getLength(message))
        }
    }


    class Point {
        x
        y
    }


    function interpolateLin (x, p0, p1) {
        return p0.y + (x - p0.x) * (p1.y - p0.y) / (p1.x - p0.x)
    }



    class LineSegment {
        p0
        p1
        dx
        dy
    }

    function computeSlope (p0, p1) {
        return p1.x !== p0.x ? (p1.y - p0.y) / (p1.x - p0.x) : 0
    }

    function removePointsBeforeFrame (points, frame) {
        const newPoints = []
        let i = 0
        while (i < points.length) {
            if (frame <= points[i].x) {
                newPoints.push(points[i])
            }
            i++
        }
        return newPoints
    }

    function insertNewLinePoints (points, p0, p1) {
        const newPoints = []
        let i = 0
        
        // Keep the points that are before the new points added
        while (i < points.length && points[i].x <= p0.x) {
            newPoints.push(points[i])
            i++
        }
        
        // Find the start value of the start point :
        
        // 1. If there is a previous point and that previous point
        // is on the same frame, we don't modify the start point value.
        // (represents a vertical line).
        if (0 < i - 1 && points[i - 1].x === p0.x) {

        // 2. If new points are inserted in between already existing points 
        // we need to interpolate the existing line to find the startValue.
        } else if (0 < i && i < points.length) {
            newPoints.push({
                x: p0.x,
                y: interpolateLin(p0.x, points[i - 1], points[i])
            })

        // 3. If new line is inserted after all existing points, 
        // we just take the value of the last point
        } else if (i >= points.length && points.length) {
            newPoints.push({
                x: p0.x,
                y: points[points.length - 1].y,
            })

        // 4. If new line placed in first position, we take the defaultStartValue.
        } else if (i === 0) {
            newPoints.push({
                x: p0.x,
                y: p0.y,
            })
        }
        
        newPoints.push({
            x: p1.x,
            y: p1.y,
        })
        return newPoints
    }

    function computeFrameAjustedPoints (points) {
        if (points.length < 2) {
            throw new Error('invalid length for points')
        }

        const newPoints = []
        let i = 0
        let p = points[0]
        let frameLower = 0
        let frameUpper = 0
        
        while(i < points.length) {
            p = points[i]
            frameLower = Math.floor(p.x)
            frameUpper = frameLower + 1

            // I. Placing interpolated point at the lower bound of the current frame
            // ------------------------------------------------------------------------
            // 1. Point is already on an exact frame,
            if (p.x === frameLower) {
                newPoints.push({ x: p.x, y: p.y })

                // 1.a. if several of the next points are also on the same X,
                // we find the last one to draw a vertical line.
                while (
                    (i + 1) < points.length
                    && points[i + 1].x === frameLower
                ) {
                    i++
                }
                if (points[i].y !== newPoints[newPoints.length - 1].y) {
                    newPoints.push({ x: points[i].x, y: points[i].y })
                }

                // 1.b. if last point, we quit
                if (i + 1 >= points.length) {
                    break
                }

                // 1.c. if next point is in a different frame we can move on to next iteration
                if (frameUpper <= points[i + 1].x) {
                    i++
                    continue
                }
            
            // 2. Point isn't on an exact frame
            // 2.a. There's a previous point, the we use it to interpolate the value.
            } else if (newPoints.length) {
                newPoints.push({
                    x: frameLower,
                    y: interpolateLin(frameLower, points[i - 1], p),
                })
            
            // 2.b. It's the very first point, then we don't change its value.
            } else {
                newPoints.push({ x: frameLower, y: p.y })
            }

            // II. Placing interpolated point at the upper bound of the current frame
            // ---------------------------------------------------------------------------
            // First, we find the closest point from the frame upper bound (could be the same p).
            // Or could be a point that is exactly placed on frameUpper.
            while (
                (i + 1) < points.length 
                && (
                    Math.ceil(points[i + 1].x) === frameUpper
                    || Math.floor(points[i + 1].x) === frameUpper
                )
            ) {
                i++
            }
            p = points[i]

            // 1. If the next point is directly in the next frame, 
            // we do nothing, as this corresponds with next iteration frameLower.
            if (Math.floor(p.x) === frameUpper) {
                continue
            
            // 2. If there's still a point after p, we use it to interpolate the value
            } else if (i < points.length - 1) {
                newPoints.push({
                    x: frameUpper,
                    y: interpolateLin(frameUpper, p, points[i + 1]),
                })

            // 3. If it's the last point, we dont change the value
            } else {
                newPoints.push({ x: frameUpper, y: p.y })
            }

            i++
        }

        return newPoints
    }

    function computeLineSegments (points) {
        const lineSegments = []
        let i = 0
        let p0
        let p1

        while(i < points.length - 1) {
            p0 = points[i]
            p1 = points[i + 1]
            lineSegments.push({
                p0, p1, 
                dy: computeSlope(p0, p1),
                dx: 1,
            })
            i++
        }
        return lineSegments
    }



        
                            function n_0_0_RCVS_0 (m) {
                                
                n_0_0_STATE_funcMessageReceiver(m)
                return
            
                                throw new Error('[tgl], id "n_0_0", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

            let n_0_0_STATE_value = 0

            

            function n_0_0_STATE_funcPrepareStoreValueBang (value) {
                    return value === 0 ? 1: 0
                }

            function n_0_0_STATE_funcMessageReceiver (m) {
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_0_0_STATE_value = msg_readFloatToken(m, 0)
                    const outMessage = msg_floats([n_0_0_STATE_value])
                    n_0_1_RCVS_0(outMessage)
                    if (n_0_0_STATE_sendBusName !== "empty") {
                        msgBusPublish(n_0_0_STATE_sendBusName, outMessage)
                    }

                } else if (msg_isBang(m)) {
                    n_0_0_STATE_value = n_0_0_STATE_funcPrepareStoreValueBang(n_0_0_STATE_value)
                    const outMessage = msg_floats([n_0_0_STATE_value])
                    n_0_1_RCVS_0(outMessage)
                    if (n_0_0_STATE_sendBusName !== "empty") {
                        msgBusPublish(n_0_0_STATE_sendBusName, outMessage)
                    }

                } else if (
                    msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN]) 
                    && msg_readStringToken(m, 0) === 'set'
                ) {
                    n_0_0_STATE_value = msg_readFloatToken(m, 1)
                }
            
                
    if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'receive'
    ) {
        n_0_0_STATE_funcSetReceiveBusName(msg_readStringToken(m, 1))
        return

    } else if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'send'
    ) {
        n_0_0_STATE_sendBusName = msg_readStringToken(m, 1)
        return
    }

            }

            
    let n_0_0_STATE_receiveBusName = "empty"
    let n_0_0_STATE_sendBusName = "empty"

    function n_0_0_STATE_funcSetReceiveBusName (busName) {
        if (n_0_0_STATE_receiveBusName !== "empty") {
            msgBusUnsubscribe(n_0_0_STATE_receiveBusName, n_0_0_STATE_funcMessageReceiver)
        }
        n_0_0_STATE_receiveBusName = busName
        if (n_0_0_STATE_receiveBusName !== "empty") {
            msgBusSubscribe(n_0_0_STATE_receiveBusName, n_0_0_STATE_funcMessageReceiver)
        }
    }

    commons_waitEngineConfigure(() => {
        n_0_0_STATE_funcSetReceiveBusName("empty")
    })


            
        

                            function n_0_1_RCVS_0 (m) {
                                
    if (msg_getLength(m) === 1) {
        if (
            (msg_isFloatToken(m, 0) && msg_readFloatToken(m, 0) === 0)
            || msg_isAction(m, 'stop')
        ) {
            n_0_1_STATE_funcStop()
            return

        } else if (
            msg_isFloatToken(m, 0)
            || msg_isBang(m)
        ) {
            n_0_1_STATE_realNextTick = toFloat(FRAME)
            n_0_1_STATE_funcScheduleNextTick()
            return
        }
    }
    
                                throw new Error('[metro], id "n_0_1", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

                            function n_0_1_RCVS_1 (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_1_STATE_funcSetRate(msg_readFloatToken(m, 0))
        return
    }
                                throw new Error('[metro], id "n_0_1", inlet "1", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_1_STATE_rate = 0
        let n_0_1_STATE_sampleRatio = 1
        let n_0_1_STATE_skedId = SKED_ID_NULL
        let n_0_1_STATE_realNextTick = -1

        function n_0_1_STATE_funcSetRate (rate) {
            n_0_1_STATE_rate = Math.max(rate, 0)
        }

        function n_0_1_STATE_funcScheduleNextTick () {
            n_0_2_RCVS_0(msg_bang())
            n_0_1_STATE_realNextTick = n_0_1_STATE_realNextTick + n_0_1_STATE_rate * n_0_1_STATE_sampleRatio
            n_0_1_STATE_skedId = commons_waitFrame(toInt(Math.round(n_0_1_STATE_realNextTick)), () => {
                n_0_1_STATE_funcScheduleNextTick()
            })
        }

        function n_0_1_STATE_funcStop () {
            if (n_0_1_STATE_skedId !== SKED_ID_NULL) {
                commons_cancelWaitFrame(n_0_1_STATE_skedId)
                n_0_1_STATE_skedId = SKED_ID_NULL
            }
            n_0_1_STATE_realNextTick = 0
        }

        commons_waitEngineConfigure(() => {
            n_0_1_STATE_sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_0_1_STATE_funcSetRate(100)
        })
    

                            function n_0_2_RCVS_0 (m) {
                                
    if (msg_isBang(m)) {
        n_0_3_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_2_STATE_maxValue)]))
        return
    } else if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
        && msg_readStringToken(m, 0) === 'seed'
    ) {
        console.log('WARNING : seed not implemented yet for [random]')
        return
    }
    
                                throw new Error('[random], id "n_0_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

                            function n_0_2_RCVS_1 (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_2_STATE_funcSetMaxValue(msg_readFloatToken(m, 0))
        return
    }
                                throw new Error('[random], id "n_0_2", inlet "1", unsupported message : ' + msg_display(m))
                            }
                        

    let n_0_2_STATE_maxValue = 0

    function n_0_2_STATE_funcSetMaxValue (maxValue) {
        n_0_2_STATE_maxValue = Math.max(maxValue, 0)
    }


                            function n_0_3_RCVS_0 (m) {
                                
            if (n_0_3_STATE_filterType === MSG_STRING_TOKEN) {
                if (
                    (n_0_3_STATE_stringFilter === 'float'
                        && msg_isFloatToken(m, 0))
                    || (n_0_3_STATE_stringFilter === 'symbol'
                        && msg_isStringToken(m, 0))
                    || (n_0_3_STATE_stringFilter === 'list'
                        && msg_getLength(m) > 1)
                    || (n_0_3_STATE_stringFilter === 'bang' 
                        && msg_isBang(m))
                ) {
                    n_0_3_SNDS_0(m)
                    return
                
                } else if (
                    msg_isStringToken(m, 0)
                    && msg_readStringToken(m, 0) === n_0_3_STATE_stringFilter
                ) {
                    n_0_3_SNDS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }

            } else if (
                msg_isFloatToken(m, 0)
                && msg_readFloatToken(m, 0) === n_0_3_STATE_floatFilter
            ) {
                n_0_3_SNDS_0(msg_emptyToBang(msg_shift(m)))
                return
            }
        
            SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_3", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    
        let n_0_3_STATE_floatFilter = 0
        let n_0_3_STATE_stringFilter = "0"
        let n_0_3_STATE_filterType = MSG_FLOAT_TOKEN
    


                            function n_0_8_RCVS_0 (m) {
                                
    msgBusPublish(n_0_8_STATE_busName, m)
    return
    
                                throw new Error('[send], id "n_0_8", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    let n_0_8_STATE_busName = "bng_0"


                            function n_0_11_RCVS_0 (m) {
                                
    if (msg_isBang(m)) {
        n_0_12_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_11_STATE_maxValue)]))
        return
    } else if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
        && msg_readStringToken(m, 0) === 'seed'
    ) {
        console.log('WARNING : seed not implemented yet for [random]')
        return
    }
    
                                throw new Error('[random], id "n_0_11", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    let n_0_11_STATE_maxValue = 100

    function n_0_11_STATE_funcSetMaxValue (maxValue) {
        n_0_11_STATE_maxValue = Math.max(maxValue, 0)
    }


                            function n_0_12_RCVS_0 (m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_0_12_STATE_funcSetLeftOp(msg_readFloatToken(m, 0))
            n_0_36_RCVS_0(msg_floats([n_0_12_STATE_rightOp !== 0 ? n_0_12_STATE_leftOp / n_0_12_STATE_rightOp: 0]))
            return
        
        } else if (msg_isBang(m)) {
            n_0_36_RCVS_0(msg_floats([n_0_12_STATE_rightOp !== 0 ? n_0_12_STATE_leftOp / n_0_12_STATE_rightOp: 0]))
            return
        }
        
                                throw new Error('[/], id "n_0_12", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_12_STATE_leftOp = 0
        let n_0_12_STATE_rightOp = 0

        const n_0_12_STATE_funcSetLeftOp = (value) => {
            n_0_12_STATE_leftOp = value
        }

        const n_0_12_STATE_funcSetRightOp = (value) => {
            n_0_12_STATE_rightOp = value
        }

        n_0_12_STATE_funcSetLeftOp(0)
        n_0_12_STATE_funcSetRightOp(100)
    

                            function n_0_36_RCVS_0 (m) {
                                
    msgBusPublish(n_0_36_STATE_busName, m)
    return
    
                                throw new Error('[send], id "n_0_36", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    let n_0_36_STATE_busName = "rdm_0"


                            function n_0_4_RCVS_0 (m) {
                                
                n_0_4_STATE_funcMessageReceiver(m)
                return
            
                                throw new Error('[floatatom], id "n_0_4", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

            let n_0_4_STATE_value = msg_floats([0])
            
            function n_0_4_STATE_funcMessageReceiver (m) {
                
    if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'receive'
    ) {
        n_0_4_STATE_funcSetReceiveBusName(msg_readStringToken(m, 1))
        return

    } else if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'send'
    ) {
        n_0_4_STATE_sendBusName = msg_readStringToken(m, 1)
        return
    }

                else if (msg_isBang(m)) {
                    n_0_2_RCVS_1(n_0_4_STATE_value)
                    if (n_0_4_STATE_sendBusName !== "empty") {
                        msgBusPublish(n_0_4_STATE_sendBusName, n_0_4_STATE_value)
                    }
                    return
                
                } else if (
                    msg_getTokenType(m, 0) === MSG_STRING_TOKEN
                    && msg_readStringToken(m, 0) === 'set'
                ) {
                    const setMessage = msg_slice(m, 1, msg_getLength(m))
                    if (msg_isMatching(setMessage, [MSG_FLOAT_TOKEN])) { 
                            n_0_4_STATE_value = setMessage    
                            return
                    }

                } else if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                
                    n_0_4_STATE_value = m
                    n_0_2_RCVS_1(n_0_4_STATE_value)
                    if (n_0_4_STATE_sendBusName !== "empty") {
                        msgBusPublish(n_0_4_STATE_sendBusName, n_0_4_STATE_value)
                    }
                    return

                }
                throw new Error('unsupported message ' + msg_display(m))
            }

            
    let n_0_4_STATE_receiveBusName = "empty"
    let n_0_4_STATE_sendBusName = "empty"

    function n_0_4_STATE_funcSetReceiveBusName (busName) {
        if (n_0_4_STATE_receiveBusName !== "empty") {
            msgBusUnsubscribe(n_0_4_STATE_receiveBusName, n_0_4_STATE_funcMessageReceiver)
        }
        n_0_4_STATE_receiveBusName = busName
        if (n_0_4_STATE_receiveBusName !== "empty") {
            msgBusSubscribe(n_0_4_STATE_receiveBusName, n_0_4_STATE_funcMessageReceiver)
        }
    }

    commons_waitEngineConfigure(() => {
        n_0_4_STATE_funcSetReceiveBusName("empty")
    })

        

                            function n_0_5_RCVS_0 (m) {
                                
    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_5_STATE_funcSetValue(msg_readFloatToken(m, 0))
        n_0_29_RCVS_0(msg_floats([n_0_5_STATE_value]))
        return 

    } else if (msg_isBang(m)) {
        n_0_29_RCVS_0(msg_floats([n_0_5_STATE_value]))
        return
        
    }
    
                                throw new Error('[float], id "n_0_5", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

                            function n_0_5_RCVS_1 (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_5_STATE_funcSetValue(msg_readFloatToken(m, 0))
        return
    }
                                throw new Error('[float], id "n_0_5", inlet "1", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_5_STATE_value = 0

        const n_0_5_STATE_funcSetValue = (value) => { n_0_5_STATE_value = value }
        
        n_0_5_STATE_funcSetValue(0)
    

                            function n_0_29_RCVS_0 (m) {
                                
    msgBusPublish(n_0_29_STATE_busName, m)
    return
    
                                throw new Error('[send], id "n_0_29", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    let n_0_29_STATE_busName = "range_0"


                            function n_0_6_RCVS_0 (m) {
                                
    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_6_STATE_funcSetValue(msg_readFloatToken(m, 0))
        n_0_28_RCVS_0(msg_floats([n_0_6_STATE_value]))
        return 

    } else if (msg_isBang(m)) {
        n_0_28_RCVS_0(msg_floats([n_0_6_STATE_value]))
        return
        
    }
    
                                throw new Error('[float], id "n_0_6", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

                            function n_0_6_RCVS_1 (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_6_STATE_funcSetValue(msg_readFloatToken(m, 0))
        return
    }
                                throw new Error('[float], id "n_0_6", inlet "1", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_6_STATE_value = 0

        const n_0_6_STATE_funcSetValue = (value) => { n_0_6_STATE_value = value }
        
        n_0_6_STATE_funcSetValue(0)
    

                            function n_0_28_RCVS_0 (m) {
                                
    msgBusPublish(n_0_28_STATE_busName, m)
    return
    
                                throw new Error('[send], id "n_0_28", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    let n_0_28_STATE_busName = "min_0"


    commons_waitEngineConfigure(() => {
        msgBusSubscribe("bng_0", n_0_7_SNDS_0)
    })


                            function n_0_9_RCVS_0 (m) {
                                
            n_0_9_STATE_funcMessageReceiver(m)
            return
        
                                throw new Error('[bang], id "n_0_9", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        function n_0_9_STATE_funcMessageReceiver (m) {
            
    if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'receive'
    ) {
        n_0_9_STATE_funcSetReceiveBusName(msg_readStringToken(m, 1))
        return

    } else if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'send'
    ) {
        n_0_9_STATE_sendBusName = msg_readStringToken(m, 1)
        return
    }

            else {
                const outMessage = msg_bang()
                n_0_9_SNDS_0(outMessage)
                if (n_0_9_STATE_sendBusName !== "empty") {
                    msgBusPublish(n_0_9_STATE_sendBusName, outMessage)
                }
                return
            }
        }

        
    let n_0_9_STATE_receiveBusName = "empty"
    let n_0_9_STATE_sendBusName = "empty"

    function n_0_9_STATE_funcSetReceiveBusName (busName) {
        if (n_0_9_STATE_receiveBusName !== "empty") {
            msgBusUnsubscribe(n_0_9_STATE_receiveBusName, n_0_9_STATE_funcMessageReceiver)
        }
        n_0_9_STATE_receiveBusName = busName
        if (n_0_9_STATE_receiveBusName !== "empty") {
            msgBusSubscribe(n_0_9_STATE_receiveBusName, n_0_9_STATE_funcMessageReceiver)
        }
    }

    commons_waitEngineConfigure(() => {
        n_0_9_STATE_funcSetReceiveBusName("empty")
    })


        
    

                            function n_0_14_RCVS_0 (m) {
                                
    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_14_STATE_funcSetValue(msg_readFloatToken(m, 0))
        SND_TO_NULL(msg_floats([n_0_14_STATE_value]))
        return 

    } else if (msg_isBang(m)) {
        SND_TO_NULL(msg_floats([n_0_14_STATE_value]))
        return
        
    }
    
                                throw new Error('[float], id "n_0_14", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

                            function n_0_14_RCVS_1 (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_14_STATE_funcSetValue(msg_readFloatToken(m, 0))
        return
    }
                                throw new Error('[float], id "n_0_14", inlet "1", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_14_STATE_value = 0

        const n_0_14_STATE_funcSetValue = (value) => { n_0_14_STATE_value = value }
        
        n_0_14_STATE_funcSetValue(0)
    

                            function n_0_15_RCVS_0 (m) {
                                
    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_15_STATE_funcSetValue(msg_readFloatToken(m, 0))
        n_0_16_RCVS_0(msg_floats([n_0_15_STATE_value]))
        return 

    } else if (msg_isBang(m)) {
        n_0_16_RCVS_0(msg_floats([n_0_15_STATE_value]))
        return
        
    }
    
                                throw new Error('[float], id "n_0_15", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

                            function n_0_15_RCVS_1 (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_15_STATE_funcSetValue(msg_readFloatToken(m, 0))
        return
    }
                                throw new Error('[float], id "n_0_15", inlet "1", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_15_STATE_value = 0

        const n_0_15_STATE_funcSetValue = (value) => { n_0_15_STATE_value = value }
        
        n_0_15_STATE_funcSetValue(0)
    

                            function n_0_16_RCVS_0 (m) {
                                
        if (
            msg_isStringToken(m, 0) 
            && msg_readStringToken(m, 0) === 'set'
        ) {
            n_0_16_STATE_outTemplates = [[]]
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    n_0_16_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
                } else {
                    n_0_16_STATE_outTemplates[0].push(MSG_STRING_TOKEN)
                    n_0_16_STATE_outTemplates[0].push(msg_readStringToken(m, i).length)
                }
            }

            const message = msg_create(n_0_16_STATE_outTemplates[0])
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    msg_writeFloatToken(
                        message, i - 1, msg_readFloatToken(m, i)
                    )
                } else {
                    msg_writeStringToken(
                        message, i - 1, msg_readStringToken(m, i)
                    )
                }
            }
            n_0_16_STATE_outMessages[0] = message
            n_0_16_STATE_messageTransferFunctions.splice(0, n_0_16_STATE_messageTransferFunctions.length - 1)
            n_0_16_STATE_messageTransferFunctions[0] = (m) => { return n_0_16_STATE_outMessages[0] }
            return

        } else {
            for (let i = 0; i < n_0_16_STATE_messageTransferFunctions.length; i++) {
                n_0_45_RCVS_0(n_0_16_STATE_messageTransferFunctions[i](m))
            }
            return
        }
    
                                throw new Error('[msg], id "n_0_16", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_16_STATE_outTemplates = []
        let n_0_16_STATE_outMessages = []
        
            
            
            
            n_0_16_STATE_outTemplates[0] = []
            
                n_0_16_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
                       
            n_0_16_STATE_outMessages[0] = msg_create(n_0_16_STATE_outTemplates[0])
            
                msg_writeFloatToken(n_0_16_STATE_outMessages[0], 0, 0)
            
        
        
        const n_0_16_STATE_messageTransferFunctions = [
            
                (inMessage) => {
                    
                    return n_0_16_STATE_outMessages[0]
                },
                (inMessage) => {
                    
            
            
            let stringMem = []
            n_0_16_STATE_outTemplates[1] = []
            
                n_0_16_STATE_outTemplates[1].push(MSG_FLOAT_TOKEN)
            
                n_0_16_STATE_outTemplates[1].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_0_16_STATE_outTemplates[1].push(stringMem[0].length)
                }
                       
            n_0_16_STATE_outMessages[1] = msg_create(n_0_16_STATE_outTemplates[1])
            
                msg_writeFloatToken(n_0_16_STATE_outMessages[1], 0, 1)
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_0_16_STATE_outMessages[1], 1, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_0_16_STATE_outMessages[1], 1, stringMem[0])
                }
            
        
                    return n_0_16_STATE_outMessages[1]
                }
        ]
    
let n_0_45_OUTS_0 = 0

                            function n_0_45_RCVS_0 (m) {
                                
    if (
        msg_isMatching(m, [MSG_FLOAT_TOKEN])
        || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
    ) {
        switch (msg_getLength(m)) {
            case 2:
                n_0_45_STATE_funcSetNextDuration(msg_readFloatToken(m, 1))
            case 1:
                n_0_45_STATE_funcSetNewLine(msg_readFloatToken(m, 0))
        }
        return

    } else if (msg_isAction(m, 'stop')) {
        n_0_45_STATE_funcStopCurrentLine()
        return

    }
    
                                throw new Error('[line~], id "n_0_45", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    const n_0_45_STATE_defaultLine = {
        p0: {x: -1, y: 0},
        p1: {x: -1, y: 0},
        dx: 1,
        dy: 0,
    }
    let n_0_45_STATE_currentLine = n_0_45_STATE_defaultLine
    let n_0_45_STATE_currentValue = 0
    let n_0_45_STATE_nextDurationSamp = 0

    function n_0_45_STATE_funcSetNewLine (targetValue) {
        const startFrame = toFloat(FRAME)
        const endFrame = toFloat(FRAME) + n_0_45_STATE_nextDurationSamp
        if (endFrame === toFloat(FRAME)) {
            n_0_45_STATE_currentLine = n_0_45_STATE_defaultLine
            n_0_45_STATE_currentValue = targetValue
            n_0_45_STATE_nextDurationSamp = 0
        } else {
            n_0_45_STATE_currentLine = {
                p0: {
                    x: startFrame, 
                    y: n_0_45_STATE_currentValue,
                }, 
                p1: {
                    x: endFrame, 
                    y: targetValue,
                }, 
                dx: 1,
                dy: 0,
            }
            n_0_45_STATE_currentLine.dy = computeSlope(n_0_45_STATE_currentLine.p0, n_0_45_STATE_currentLine.p1)
            n_0_45_STATE_nextDurationSamp = 0
        }
    }

    function n_0_45_STATE_funcSetNextDuration (durationMsec) {
        n_0_45_STATE_nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
    }

    function n_0_45_STATE_funcStopCurrentLine () {
        n_0_45_STATE_currentLine.p1.x = -1
        n_0_45_STATE_currentLine.p1.y = n_0_45_STATE_currentValue
    }


                            function n_0_22_RCVS_0 (m) {
                                
    if (msg_isBang(m)) {
        n_0_21_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_22_STATE_maxValue)]))
        return
    } else if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
        && msg_readStringToken(m, 0) === 'seed'
    ) {
        console.log('WARNING : seed not implemented yet for [random]')
        return
    }
    
                                throw new Error('[random], id "n_0_22", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    let n_0_22_STATE_maxValue = 800

    function n_0_22_STATE_funcSetMaxValue (maxValue) {
        n_0_22_STATE_maxValue = Math.max(maxValue, 0)
    }


                            function n_0_21_RCVS_0 (m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_0_21_STATE_funcSetLeftOp(msg_readFloatToken(m, 0))
            n_0_5_RCVS_1(msg_floats([n_0_21_STATE_leftOp + n_0_21_STATE_rightOp]))
            return
        
        } else if (msg_isBang(m)) {
            n_0_5_RCVS_1(msg_floats([n_0_21_STATE_leftOp + n_0_21_STATE_rightOp]))
            return
        }
        
                                throw new Error('[+], id "n_0_21", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_21_STATE_leftOp = 0
        let n_0_21_STATE_rightOp = 0

        const n_0_21_STATE_funcSetLeftOp = (value) => {
            n_0_21_STATE_leftOp = value
        }

        const n_0_21_STATE_funcSetRightOp = (value) => {
            n_0_21_STATE_rightOp = value
        }

        n_0_21_STATE_funcSetLeftOp(0)
        n_0_21_STATE_funcSetRightOp(500)
    

                            function n_0_23_RCVS_0 (m) {
                                
    if (msg_isBang(m)) {
        n_0_32_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_23_STATE_maxValue)]))
        return
    } else if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
        && msg_readStringToken(m, 0) === 'seed'
    ) {
        console.log('WARNING : seed not implemented yet for [random]')
        return
    }
    
                                throw new Error('[random], id "n_0_23", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    let n_0_23_STATE_maxValue = 100

    function n_0_23_STATE_funcSetMaxValue (maxValue) {
        n_0_23_STATE_maxValue = Math.max(maxValue, 0)
    }


                            function n_0_32_RCVS_0 (m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_0_32_STATE_funcSetLeftOp(msg_readFloatToken(m, 0))
            n_0_6_RCVS_1(msg_floats([n_0_32_STATE_leftOp + n_0_32_STATE_rightOp]))
            return
        
        } else if (msg_isBang(m)) {
            n_0_6_RCVS_1(msg_floats([n_0_32_STATE_leftOp + n_0_32_STATE_rightOp]))
            return
        }
        
                                throw new Error('[+], id "n_0_32", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_32_STATE_leftOp = 0
        let n_0_32_STATE_rightOp = 0

        const n_0_32_STATE_funcSetLeftOp = (value) => {
            n_0_32_STATE_leftOp = value
        }

        const n_0_32_STATE_funcSetRightOp = (value) => {
            n_0_32_STATE_rightOp = value
        }

        n_0_32_STATE_funcSetLeftOp(0)
        n_0_32_STATE_funcSetRightOp(300)
    

                            function n_0_10_RCVS_0 (m) {
                                
    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_10_STATE_funcSetValue(msg_readFloatToken(m, 0))
        n_0_52_RCVS_0(msg_floats([n_0_10_STATE_value]))
        return 

    } else if (msg_isBang(m)) {
        n_0_52_RCVS_0(msg_floats([n_0_10_STATE_value]))
        return
        
    }
    
                                throw new Error('[float], id "n_0_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

                            function n_0_10_RCVS_1 (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_10_STATE_funcSetValue(msg_readFloatToken(m, 0))
        return
    }
                                throw new Error('[float], id "n_0_10", inlet "1", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_10_STATE_value = 0

        const n_0_10_STATE_funcSetValue = (value) => { n_0_10_STATE_value = value }
        
        n_0_10_STATE_funcSetValue(0)
    

                            function n_0_52_RCVS_0 (m) {
                                
        if (
            msg_isStringToken(m, 0) 
            && msg_readStringToken(m, 0) === 'set'
        ) {
            n_0_52_STATE_outTemplates = [[]]
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    n_0_52_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
                } else {
                    n_0_52_STATE_outTemplates[0].push(MSG_STRING_TOKEN)
                    n_0_52_STATE_outTemplates[0].push(msg_readStringToken(m, i).length)
                }
            }

            const message = msg_create(n_0_52_STATE_outTemplates[0])
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    msg_writeFloatToken(
                        message, i - 1, msg_readFloatToken(m, i)
                    )
                } else {
                    msg_writeStringToken(
                        message, i - 1, msg_readStringToken(m, i)
                    )
                }
            }
            n_0_52_STATE_outMessages[0] = message
            n_0_52_STATE_messageTransferFunctions.splice(0, n_0_52_STATE_messageTransferFunctions.length - 1)
            n_0_52_STATE_messageTransferFunctions[0] = (m) => { return n_0_52_STATE_outMessages[0] }
            return

        } else {
            for (let i = 0; i < n_0_52_STATE_messageTransferFunctions.length; i++) {
                n_0_44_RCVS_0(n_0_52_STATE_messageTransferFunctions[i](m))
            }
            return
        }
    
                                throw new Error('[msg], id "n_0_52", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_52_STATE_outTemplates = []
        let n_0_52_STATE_outMessages = []
        
        
        const n_0_52_STATE_messageTransferFunctions = [
            
                (inMessage) => {
                    
            
            
            let stringMem = []
            n_0_52_STATE_outTemplates[0] = []
            
                n_0_52_STATE_outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_0_52_STATE_outTemplates[0].push(stringMem[0].length)
                }
            
                n_0_52_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
                       
            n_0_52_STATE_outMessages[0] = msg_create(n_0_52_STATE_outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_0_52_STATE_outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_0_52_STATE_outMessages[0], 0, stringMem[0])
                }
            
                msg_writeFloatToken(n_0_52_STATE_outMessages[0], 1, 10)
            
        
                    return n_0_52_STATE_outMessages[0]
                }
        ]
    
let n_0_44_OUTS_0 = 0

                            function n_0_44_RCVS_0 (m) {
                                
    if (
        msg_isMatching(m, [MSG_FLOAT_TOKEN])
        || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
    ) {
        switch (msg_getLength(m)) {
            case 2:
                n_0_44_STATE_funcSetNextDuration(msg_readFloatToken(m, 1))
            case 1:
                n_0_44_STATE_funcSetNewLine(msg_readFloatToken(m, 0))
        }
        return

    } else if (msg_isAction(m, 'stop')) {
        n_0_44_STATE_funcStopCurrentLine()
        return

    }
    
                                throw new Error('[line~], id "n_0_44", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    const n_0_44_STATE_defaultLine = {
        p0: {x: -1, y: 0},
        p1: {x: -1, y: 0},
        dx: 1,
        dy: 0,
    }
    let n_0_44_STATE_currentLine = n_0_44_STATE_defaultLine
    let n_0_44_STATE_currentValue = 0
    let n_0_44_STATE_nextDurationSamp = 0

    function n_0_44_STATE_funcSetNewLine (targetValue) {
        const startFrame = toFloat(FRAME)
        const endFrame = toFloat(FRAME) + n_0_44_STATE_nextDurationSamp
        if (endFrame === toFloat(FRAME)) {
            n_0_44_STATE_currentLine = n_0_44_STATE_defaultLine
            n_0_44_STATE_currentValue = targetValue
            n_0_44_STATE_nextDurationSamp = 0
        } else {
            n_0_44_STATE_currentLine = {
                p0: {
                    x: startFrame, 
                    y: n_0_44_STATE_currentValue,
                }, 
                p1: {
                    x: endFrame, 
                    y: targetValue,
                }, 
                dx: 1,
                dy: 0,
            }
            n_0_44_STATE_currentLine.dy = computeSlope(n_0_44_STATE_currentLine.p0, n_0_44_STATE_currentLine.p1)
            n_0_44_STATE_nextDurationSamp = 0
        }
    }

    function n_0_44_STATE_funcSetNextDuration (durationMsec) {
        n_0_44_STATE_nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
    }

    function n_0_44_STATE_funcStopCurrentLine () {
        n_0_44_STATE_currentLine.p1.x = -1
        n_0_44_STATE_currentLine.p1.y = n_0_44_STATE_currentValue
    }


                            function n_0_13_RCVS_0 (m) {
                                
    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_13_STATE_funcSetValue(msg_readFloatToken(m, 0))
        n_0_51_RCVS_0(msg_floats([n_0_13_STATE_value]))
        return 

    } else if (msg_isBang(m)) {
        n_0_51_RCVS_0(msg_floats([n_0_13_STATE_value]))
        return
        
    }
    
                                throw new Error('[float], id "n_0_13", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

                            function n_0_13_RCVS_1 (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_13_STATE_funcSetValue(msg_readFloatToken(m, 0))
        return
    }
                                throw new Error('[float], id "n_0_13", inlet "1", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_13_STATE_value = 0

        const n_0_13_STATE_funcSetValue = (value) => { n_0_13_STATE_value = value }
        
        n_0_13_STATE_funcSetValue(0)
    

                            function n_0_51_RCVS_0 (m) {
                                
        if (
            msg_isStringToken(m, 0) 
            && msg_readStringToken(m, 0) === 'set'
        ) {
            n_0_51_STATE_outTemplates = [[]]
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    n_0_51_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
                } else {
                    n_0_51_STATE_outTemplates[0].push(MSG_STRING_TOKEN)
                    n_0_51_STATE_outTemplates[0].push(msg_readStringToken(m, i).length)
                }
            }

            const message = msg_create(n_0_51_STATE_outTemplates[0])
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    msg_writeFloatToken(
                        message, i - 1, msg_readFloatToken(m, i)
                    )
                } else {
                    msg_writeStringToken(
                        message, i - 1, msg_readStringToken(m, i)
                    )
                }
            }
            n_0_51_STATE_outMessages[0] = message
            n_0_51_STATE_messageTransferFunctions.splice(0, n_0_51_STATE_messageTransferFunctions.length - 1)
            n_0_51_STATE_messageTransferFunctions[0] = (m) => { return n_0_51_STATE_outMessages[0] }
            return

        } else {
            for (let i = 0; i < n_0_51_STATE_messageTransferFunctions.length; i++) {
                n_0_44_RCVS_0(n_0_51_STATE_messageTransferFunctions[i](m))
            }
            return
        }
    
                                throw new Error('[msg], id "n_0_51", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_51_STATE_outTemplates = []
        let n_0_51_STATE_outMessages = []
        
        
        const n_0_51_STATE_messageTransferFunctions = [
            
                (inMessage) => {
                    
            
            
            let stringMem = []
            n_0_51_STATE_outTemplates[0] = []
            
                n_0_51_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
            
                n_0_51_STATE_outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_0_51_STATE_outTemplates[0].push(stringMem[0].length)
                }
                       
            n_0_51_STATE_outMessages[0] = msg_create(n_0_51_STATE_outTemplates[0])
            
                msg_writeFloatToken(n_0_51_STATE_outMessages[0], 0, 0)
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_0_51_STATE_outMessages[0], 1, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_0_51_STATE_outMessages[0], 1, stringMem[0])
                }
            
        
                    return n_0_51_STATE_outMessages[0]
                }
        ]
    

                            function n_0_20_RCVS_0 (m) {
                                
                n_0_20_STATE_funcMessageReceiver(m)
                return
            
                                throw new Error('[floatatom], id "n_0_20", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

            let n_0_20_STATE_value = msg_floats([0])
            
            function n_0_20_STATE_funcMessageReceiver (m) {
                
    if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'receive'
    ) {
        n_0_20_STATE_funcSetReceiveBusName(msg_readStringToken(m, 1))
        return

    } else if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'send'
    ) {
        n_0_20_STATE_sendBusName = msg_readStringToken(m, 1)
        return
    }

                else if (msg_isBang(m)) {
                    SND_TO_NULL(n_0_20_STATE_value)
                    if (n_0_20_STATE_sendBusName !== "empty") {
                        msgBusPublish(n_0_20_STATE_sendBusName, n_0_20_STATE_value)
                    }
                    return
                
                } else if (
                    msg_getTokenType(m, 0) === MSG_STRING_TOKEN
                    && msg_readStringToken(m, 0) === 'set'
                ) {
                    const setMessage = msg_slice(m, 1, msg_getLength(m))
                    if (msg_isMatching(setMessage, [MSG_FLOAT_TOKEN])) { 
                            n_0_20_STATE_value = setMessage    
                            return
                    }

                } else if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                
                    n_0_20_STATE_value = m
                    SND_TO_NULL(n_0_20_STATE_value)
                    if (n_0_20_STATE_sendBusName !== "empty") {
                        msgBusPublish(n_0_20_STATE_sendBusName, n_0_20_STATE_value)
                    }
                    return

                }
                throw new Error('unsupported message ' + msg_display(m))
            }

            
    let n_0_20_STATE_receiveBusName = "empty"
    let n_0_20_STATE_sendBusName = "empty"

    function n_0_20_STATE_funcSetReceiveBusName (busName) {
        if (n_0_20_STATE_receiveBusName !== "empty") {
            msgBusUnsubscribe(n_0_20_STATE_receiveBusName, n_0_20_STATE_funcMessageReceiver)
        }
        n_0_20_STATE_receiveBusName = busName
        if (n_0_20_STATE_receiveBusName !== "empty") {
            msgBusSubscribe(n_0_20_STATE_receiveBusName, n_0_20_STATE_funcMessageReceiver)
        }
    }

    commons_waitEngineConfigure(() => {
        n_0_20_STATE_funcSetReceiveBusName("empty")
    })

        

    commons_waitEngineConfigure(() => {
        msgBusSubscribe("fps_0", n_0_1_RCVS_1)
    })


    commons_waitEngineConfigure(() => {
        msgBusSubscribe("fps_0", n_0_13_RCVS_1)
    })


    commons_waitEngineConfigure(() => {
        msgBusSubscribe("fps_0", n_0_15_RCVS_1)
    })


    commons_waitEngineConfigure(() => {
        msgBusSubscribe("fps_0", n_0_14_RCVS_1)
    })


    commons_waitEngineConfigure(() => {
        msgBusSubscribe("min_0", n_0_18_RCVS_1_message)
    })

let n_0_18_INS_1 = 0
let n_0_18_OUTS_0 = 0

                            function n_0_18_RCVS_1_message (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_18_STATE_rightOp = msg_readFloatToken(m, 0)
        return
    }
                                throw new Error('[+~], id "n_0_18", inlet "1_message", unsupported message : ' + msg_display(m))
                            }
                        

        
        
                let n_0_18_STATE_rightOp = 0
            
    

    commons_waitEngineConfigure(() => {
        msgBusSubscribe("range_0", n_0_19_RCVS_1_message)
    })

let n_0_19_INS_1 = 0
let n_0_19_OUTS_0 = 0

                            function n_0_19_RCVS_1_message (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_19_STATE_rightOp = msg_readFloatToken(m, 0)
        return
    }
                                throw new Error('[*~], id "n_0_19", inlet "1_message", unsupported message : ' + msg_display(m))
                            }
                        

        
        
                let n_0_19_STATE_rightOp = 0
            
    

    commons_waitEngineConfigure(() => {
        msgBusSubscribe("bng_0", n_0_35_SNDS_0)
    })


                            function n_0_53_RCVS_0 (m) {
                                
        if (msg_getLength(m) === 1) {
            if (msg_isStringToken(m, 0)) {
                const action = msg_readStringToken(m, 0)
                if (action === 'bang' || action === 'start') {
                    n_0_53_STATE_funcScheduleDelay()
                    return
                } else if (action === 'stop') {
                    n_0_53_STATE_funcStopDelay()
                    return
                }
                
            } else if (msg_isFloatToken(m, 0)) {
                n_0_53_STATE_funcSetDelay(msg_readFloatToken(m, 0))
                n_0_53_STATE_funcScheduleDelay()
                return 
            }
        
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
            && msg_readStringToken(m, 0) === 'tempo'
        ) {
            n_0_53_STATE_sampleRatio = computeUnitInSamples(
                SAMPLE_RATE, 
                msg_readFloatToken(m, 1), 
                msg_readStringToken(m, 2)
            )
            return
        }
    
                                throw new Error('[delay], id "n_0_53", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_53_STATE_delay = 0
        let n_0_53_STATE_sampleRatio = 1
        let n_0_53_STATE_scheduledBang = -1

        const n_0_53_STATE_funcSetDelay = (delay) => {
            n_0_53_STATE_delay = Math.max(0, delay)
        }

        const n_0_53_STATE_funcScheduleDelay = () => {
            n_0_53_STATE_scheduledBang = toInt(Math.round(
                toFloat(FRAME) + n_0_53_STATE_delay * n_0_53_STATE_sampleRatio))
        }

        const n_0_53_STATE_funcStopDelay = () => {
            n_0_53_STATE_scheduledBang = -1
        }

        commons_waitEngineConfigure(() => {
            n_0_53_STATE_sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_0_53_STATE_funcSetDelay(10)
        })
    

    commons_waitEngineConfigure(() => {
        msgBusSubscribe("rdm_0", n_0_10_RCVS_1)
    })


    commons_waitEngineConfigure(() => {
        msgBusSubscribe("rdm_0", n_0_38_SNDS_0)
    })


                            function n_0_47_RCVS_0 (m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_0_47_STATE_funcSetLeftOp(msg_readFloatToken(m, 0))
            n_0_46_RCVS_1_message(msg_floats([n_0_47_STATE_leftOp - n_0_47_STATE_rightOp]))
            return
        
        } else if (msg_isBang(m)) {
            n_0_46_RCVS_1_message(msg_floats([n_0_47_STATE_leftOp - n_0_47_STATE_rightOp]))
            return
        }
        
                                throw new Error('[-], id "n_0_47", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

                            function n_0_47_RCVS_1 (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_47_STATE_funcSetRightOp(msg_readFloatToken(m, 0))
        return
    }
                                throw new Error('[-], id "n_0_47", inlet "1", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_47_STATE_leftOp = 0
        let n_0_47_STATE_rightOp = 0

        const n_0_47_STATE_funcSetLeftOp = (value) => {
            n_0_47_STATE_leftOp = value
        }

        const n_0_47_STATE_funcSetRightOp = (value) => {
            n_0_47_STATE_rightOp = value
        }

        n_0_47_STATE_funcSetLeftOp(0)
        n_0_47_STATE_funcSetRightOp(0)
    
let n_0_46_INS_1 = 0
let n_0_46_OUTS_0 = 0

                            function n_0_46_RCVS_1_message (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_46_STATE_rightOp = msg_readFloatToken(m, 0)
        return
    }
                                throw new Error('[*~], id "n_0_46", inlet "1_message", unsupported message : ' + msg_display(m))
                            }
                        

        
        
                let n_0_46_STATE_rightOp = 0
            
    

                            function n_0_49_RCVS_0 (m) {
                                
            n_0_49_STATE_funcMessageReceiver(m)
            return
        
                                throw new Error('[bang], id "n_0_49", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        function n_0_49_STATE_funcMessageReceiver (m) {
            
    if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'receive'
    ) {
        n_0_49_STATE_funcSetReceiveBusName(msg_readStringToken(m, 1))
        return

    } else if (
        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
        && msg_readStringToken(m, 0) === 'send'
    ) {
        n_0_49_STATE_sendBusName = msg_readStringToken(m, 1)
        return
    }

            else {
                const outMessage = msg_bang()
                n_0_48_RCVS_0(outMessage)
                if (n_0_49_STATE_sendBusName !== "empty") {
                    msgBusPublish(n_0_49_STATE_sendBusName, outMessage)
                }
                return
            }
        }

        
    let n_0_49_STATE_receiveBusName = "empty"
    let n_0_49_STATE_sendBusName = "empty"

    function n_0_49_STATE_funcSetReceiveBusName (busName) {
        if (n_0_49_STATE_receiveBusName !== "empty") {
            msgBusUnsubscribe(n_0_49_STATE_receiveBusName, n_0_49_STATE_funcMessageReceiver)
        }
        n_0_49_STATE_receiveBusName = busName
        if (n_0_49_STATE_receiveBusName !== "empty") {
            msgBusSubscribe(n_0_49_STATE_receiveBusName, n_0_49_STATE_funcMessageReceiver)
        }
    }

    commons_waitEngineConfigure(() => {
        n_0_49_STATE_funcSetReceiveBusName("empty")
    })


        
    

                            function n_0_48_RCVS_0 (m) {
                                
        if (
            msg_isStringToken(m, 0) 
            && msg_readStringToken(m, 0) === 'set'
        ) {
            n_0_48_STATE_outTemplates = [[]]
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    n_0_48_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
                } else {
                    n_0_48_STATE_outTemplates[0].push(MSG_STRING_TOKEN)
                    n_0_48_STATE_outTemplates[0].push(msg_readStringToken(m, i).length)
                }
            }

            const message = msg_create(n_0_48_STATE_outTemplates[0])
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    msg_writeFloatToken(
                        message, i - 1, msg_readFloatToken(m, i)
                    )
                } else {
                    msg_writeStringToken(
                        message, i - 1, msg_readStringToken(m, i)
                    )
                }
            }
            n_0_48_STATE_outMessages[0] = message
            n_0_48_STATE_messageTransferFunctions.splice(0, n_0_48_STATE_messageTransferFunctions.length - 1)
            n_0_48_STATE_messageTransferFunctions[0] = (m) => { return n_0_48_STATE_outMessages[0] }
            return

        } else {
            for (let i = 0; i < n_0_48_STATE_messageTransferFunctions.length; i++) {
                n_0_47_RCVS_0(n_0_48_STATE_messageTransferFunctions[i](m))
            }
            return
        }
    
                                throw new Error('[msg], id "n_0_48", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_48_STATE_outTemplates = []
        let n_0_48_STATE_outMessages = []
        
            
            
            
            n_0_48_STATE_outTemplates[0] = []
            
                n_0_48_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
                       
            n_0_48_STATE_outMessages[0] = msg_create(n_0_48_STATE_outTemplates[0])
            
                msg_writeFloatToken(n_0_48_STATE_outMessages[0], 0, 1)
            
        
        
        const n_0_48_STATE_messageTransferFunctions = [
            
                (inMessage) => {
                    
                    return n_0_48_STATE_outMessages[0]
                }
        ]
    
let n_0_50_INS_1 = 0
let n_0_50_OUTS_0 = 0

                            function n_0_50_RCVS_1_message (m) {
                                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
        n_0_50_STATE_rightOp = msg_readFloatToken(m, 0)
        return
    }
                                throw new Error('[*~], id "n_0_50", inlet "1_message", unsupported message : ' + msg_display(m))
                            }
                        

        
        
                let n_0_50_STATE_rightOp = 0
            
    
commons_waitFrame(0, () => n_0_1_RCVS_0(msg_bang()))

                            function n_0_56_RCVS_0 (m) {
                                
        if (
            msg_isStringToken(m, 0) 
            && msg_readStringToken(m, 0) === 'set'
        ) {
            n_0_56_STATE_outTemplates = [[]]
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    n_0_56_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
                } else {
                    n_0_56_STATE_outTemplates[0].push(MSG_STRING_TOKEN)
                    n_0_56_STATE_outTemplates[0].push(msg_readStringToken(m, i).length)
                }
            }

            const message = msg_create(n_0_56_STATE_outTemplates[0])
            for (let i = 1; i < msg_getLength(m); i++) {
                if (msg_isFloatToken(m, i)) {
                    msg_writeFloatToken(
                        message, i - 1, msg_readFloatToken(m, i)
                    )
                } else {
                    msg_writeStringToken(
                        message, i - 1, msg_readStringToken(m, i)
                    )
                }
            }
            n_0_56_STATE_outMessages[0] = message
            n_0_56_STATE_messageTransferFunctions.splice(0, n_0_56_STATE_messageTransferFunctions.length - 1)
            n_0_56_STATE_messageTransferFunctions[0] = (m) => { return n_0_56_STATE_outMessages[0] }
            return

        } else {
            for (let i = 0; i < n_0_56_STATE_messageTransferFunctions.length; i++) {
                n_0_55_RCVS_0(n_0_56_STATE_messageTransferFunctions[i](m))
            }
            return
        }
    
                                throw new Error('[msg], id "n_0_56", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

        let n_0_56_STATE_outTemplates = []
        let n_0_56_STATE_outMessages = []
        
            
            
            
            n_0_56_STATE_outTemplates[0] = []
            
                n_0_56_STATE_outTemplates[0].push(MSG_FLOAT_TOKEN)
                       
            n_0_56_STATE_outMessages[0] = msg_create(n_0_56_STATE_outTemplates[0])
            
                msg_writeFloatToken(n_0_56_STATE_outMessages[0], 0, 200)
            
        
        
        const n_0_56_STATE_messageTransferFunctions = [
            
                (inMessage) => {
                    
                    return n_0_56_STATE_outMessages[0]
                }
        ]
    

                            function n_0_55_RCVS_0 (m) {
                                
    msgBusPublish(n_0_55_STATE_busName, m)
    return
    
                                throw new Error('[send], id "n_0_55", inlet "0", unsupported message : ' + msg_display(m))
                            }
                        

    let n_0_55_STATE_busName = "fps_0"

let n_0_54_OUTS_0 = 0

        
        
    
let n_0_17_OUTS_0 = 0

        let n_0_17_STATE_phase = 0
        let n_0_17_STATE_J

        commons_waitEngineConfigure(() => {
            n_0_17_STATE_J = 2 * Math.PI / SAMPLE_RATE
        })
    
                function n_0_17_STATE_funcSetPhase (phase) {n_0_17_STATE_phase = phase % 1.0 * 2 * Math.PI}
            
let n_0_34_OUTS_0 = 0

        
        
    

        
                            function n_0_3_SNDS_0 (m) {
                                n_0_8_RCVS_0(m)
n_0_11_RCVS_0(m)
                            }
                        

                            function n_0_7_SNDS_0 (m) {
                                n_0_9_RCVS_0(m)
n_0_22_RCVS_0(m)
n_0_23_RCVS_0(m)
                            }
                        

                            function n_0_9_SNDS_0 (m) {
                                n_0_6_RCVS_0(m)
n_0_5_RCVS_0(m)
n_0_14_RCVS_0(m)
n_0_15_RCVS_0(m)
                            }
                        

                            function n_0_35_SNDS_0 (m) {
                                n_0_10_RCVS_0(m)
n_0_53_RCVS_0(m)
                            }
                        

                            function n_0_38_SNDS_0 (m) {
                                n_0_47_RCVS_1(m)
n_0_49_RCVS_0(m)
n_0_50_RCVS_1_message(m)
                            }
                        
    

        function inletCaller_n_0_0_0 (m) {n_0_0_RCVS_0(m)}
function inletCaller_n_0_4_0 (m) {n_0_4_RCVS_0(m)}
function inletCaller_n_0_9_0 (m) {n_0_9_RCVS_0(m)}
function inletCaller_n_0_16_0 (m) {n_0_16_RCVS_0(m)}
function inletCaller_n_0_20_0 (m) {n_0_20_RCVS_0(m)}
function inletCaller_n_0_48_0 (m) {n_0_48_RCVS_0(m)}
function inletCaller_n_0_49_0 (m) {n_0_49_RCVS_0(m)}
function inletCaller_n_0_51_0 (m) {n_0_51_RCVS_0(m)}
function inletCaller_n_0_52_0 (m) {n_0_52_RCVS_0(m)}
function inletCaller_n_0_56_0 (m) {n_0_56_RCVS_0(m)}

        

        const exports = {
            metadata: {"audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0,"previewDurationSeconds":15},"compilation":{"inletCallerSpecs":{"n_0_0":["0"],"n_0_4":["0"],"n_0_9":["0"],"n_0_16":["0"],"n_0_20":["0"],"n_0_48":["0"],"n_0_49":["0"],"n_0_51":["0"],"n_0_52":["0"],"n_0_56":["0"]},"outletListenerSpecs":{},"codeVariableNames":{"inletCallers":{"n_0_0":{"0":"inletCaller_n_0_0_0"},"n_0_4":{"0":"inletCaller_n_0_4_0"},"n_0_9":{"0":"inletCaller_n_0_9_0"},"n_0_16":{"0":"inletCaller_n_0_16_0"},"n_0_20":{"0":"inletCaller_n_0_20_0"},"n_0_48":{"0":"inletCaller_n_0_48_0"},"n_0_49":{"0":"inletCaller_n_0_49_0"},"n_0_51":{"0":"inletCaller_n_0_51_0"},"n_0_52":{"0":"inletCaller_n_0_52_0"},"n_0_56":{"0":"inletCaller_n_0_56_0"}},"outletListeners":{}}}},
            configure: (sampleRate, blockSize) => {
                exports.metadata.audioSettings.sampleRate = sampleRate
                exports.metadata.audioSettings.blockSize = blockSize
                SAMPLE_RATE = sampleRate
                BLOCK_SIZE = blockSize
                _commons_emitEngineConfigure()
            },
            loop: (INPUT, OUTPUT) => {
                
        for (F = 0; F < BLOCK_SIZE; F++) {
            _commons_emitFrame(FRAME)
            
    n_0_45_OUTS_0 = n_0_45_STATE_currentValue
    if (toFloat(FRAME) < n_0_45_STATE_currentLine.p1.x) {
        n_0_45_STATE_currentValue += n_0_45_STATE_currentLine.dy
        if (toFloat(FRAME + 1) >= n_0_45_STATE_currentLine.p1.x) {
            n_0_45_STATE_currentValue = n_0_45_STATE_currentLine.p1.y
        }
    }


    n_0_44_OUTS_0 = n_0_44_STATE_currentValue
    if (toFloat(FRAME) < n_0_44_STATE_currentLine.p1.x) {
        n_0_44_STATE_currentValue += n_0_44_STATE_currentLine.dy
        if (toFloat(FRAME + 1) >= n_0_44_STATE_currentLine.p1.x) {
            n_0_44_STATE_currentValue = n_0_44_STATE_currentLine.p1.y
        }
    }

n_0_18_OUTS_0 = n_0_19_OUTS_0 + n_0_18_STATE_rightOp
n_0_19_OUTS_0 = n_0_54_OUTS_0 * n_0_19_STATE_rightOp

    if (
        n_0_53_STATE_scheduledBang > -1 
        && n_0_53_STATE_scheduledBang <= FRAME
    ) {
        n_0_13_RCVS_0(msg_bang())
        n_0_53_STATE_scheduledBang = -1
    }

n_0_46_OUTS_0 = n_0_34_OUTS_0 * n_0_46_STATE_rightOp
n_0_50_OUTS_0 = n_0_34_OUTS_0 * n_0_50_STATE_rightOp
n_0_54_OUTS_0 = n_0_45_OUTS_0 * n_0_45_OUTS_0

        n_0_17_OUTS_0 = Math.cos(n_0_17_STATE_phase)
        n_0_17_STATE_phase += (n_0_17_STATE_J * n_0_18_OUTS_0)
    
n_0_34_OUTS_0 = n_0_17_OUTS_0 * n_0_44_OUTS_0
OUTPUT[0][F] = n_0_46_OUTS_0
OUTPUT[1][F] = n_0_50_OUTS_0

            FRAME++
        }
    
            },
            commons: {
                getArray: commons_getArray,
                setArray: (arrayName, array) => commons_setArray(arrayName, new Float64Array(array)),
            },
            outletListeners: {
                
            },
            inletCallers: {
                n_0_0: {

                        "0": inletCaller_n_0_0_0,
                    },
n_0_4: {

                        "0": inletCaller_n_0_4_0,
                    },
n_0_9: {

                        "0": inletCaller_n_0_9_0,
                    },
n_0_16: {

                        "0": inletCaller_n_0_16_0,
                    },
n_0_20: {

                        "0": inletCaller_n_0_20_0,
                    },
n_0_48: {

                        "0": inletCaller_n_0_48_0,
                    },
n_0_49: {

                        "0": inletCaller_n_0_49_0,
                    },
n_0_51: {

                        "0": inletCaller_n_0_51_0,
                    },
n_0_52: {

                        "0": inletCaller_n_0_52_0,
                    },
n_0_56: {

                        "0": inletCaller_n_0_56_0,
                    },
            },
            fs: {
                onReadSoundFile: () => undefined,
                onWriteSoundFile: () => undefined,
                onOpenSoundReadStream: () => undefined,
                onOpenSoundWriteStream: () => undefined,
                onSoundStreamData: () => undefined,
                onCloseSoundStream: () => undefined,
                sendReadSoundFileResponse: x_fs_onReadSoundFileResponse,
                sendWriteSoundFileResponse: x_fs_onWriteSoundFileResponse,
                sendSoundStreamData: x_fs_onSoundStreamData,
                closeSoundStream: x_fs_onCloseSoundStream,
            },
        }

        // FS IMPORTS
        const i_fs_readSoundFile = (...args) => exports.fs.onReadSoundFile(...args)
        const i_fs_writeSoundFile = (...args) => exports.fs.onWriteSoundFile(...args)
        const i_fs_openSoundReadStream = (...args) => exports.fs.onOpenSoundReadStream(...args)
        const i_fs_openSoundWriteStream = (...args) => exports.fs.onOpenSoundWriteStream(...args)
        const i_fs_sendSoundStreamData = (...args) => exports.fs.onSoundStreamData(...args)
        const i_fs_closeSoundStream = (...args) => exports.fs.onCloseSoundStream(...args)
    