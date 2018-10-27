//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

#include <stdlib.h>
#include <nan.h>

using v8::Local;
using v8::ObjectTemplate;
using v8::Object;

namespace WeakReference
{
    Nan::Persistent<ObjectTemplate> WeakReferenceClass;

    enum WeakReferenceClassField : int {
        TargetObject,
        FieldCount
    };

    /**
     * WeakReferenceClass Methods Begin
     */

    NAN_METHOD(IsDead) {
        
    }

    NAN_METHOD(SetWatcher) {
        
    }

    NAN_METHOD(Ref) {
        
    }

    /**
     * WeakReferenceClass Methods End
     */

    // Create an instance of WeakReferenceClass
    NAN_METHOD(Create) {
        if (!info[0]->IsObject()) {
            Nan::ThrowTypeError("target must be an object");
        }

        Nan::Persistent<Object> targetRef;
        Local<Object> target = info[0].As<Object>();
        targetRef.Reset(target);

        Local<ObjectTemplate> classHolder = Nan::New<ObjectTemplate>(WeakReferenceClass);
        Local<Object> weakReference = classHolder->NewInstance();

        Nan::SetInternalFieldPointer(weakReference, WeakReferenceClassField::TargetObject, &targetRef);
    }

NAN_MODULE_INIT(Initialize)
{
    Nan::HandleScope scope;
    
    Local<ObjectTemplate> classHolder = Nan::New<ObjectTemplate>();

    Nan::SetMethod(classHolder, "isDead", IsDead);
    Nan::SetMethod(classHolder, "setWatcher", SetWatcher);
    Nan::SetMethod(classHolder, "ref", Ref);

    classHolder->SetInternalFieldCount(WeakReferenceClassField::FieldCount);

    WeakReferenceClass.Reset(classHolder);

    NAN_EXPORT(target, Create);
}

NODE_MODULE(WeakReference, Initialize);
} // namespace WeakReference
